/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useContext, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'

import { Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import { logError, isUserRejected } from '../utils/sentry'
import { useTranslation } from '../contexts/Localisation'
import { ToastContext } from '../contexts/ToastContext'
import { getBscScanLink } from '../utils'
import { defaultChainId } from '../config'
import useI18n from './useI18n'

export type TxResponse = TransactionResponse | null

export type CatchTxErrorReturn = {
  fetchWithCatchTxError: (fn: () => Promise<TxResponse>) => Promise<TransactionReceipt | null>
  loading: boolean
}

type ErrorData = {
  code: number
  message: string
}

type TxError = {
  data: ErrorData
  error: string
}

// -32000 is insufficient funds for gas * price + value
const isGasEstimationError = (err: TxError): boolean => err?.data?.code === -32000

export default function useCatchTxError(): CatchTxErrorReturn {
  const { library } = useWeb3React()
  const { t } = useTranslation()
  const { addToast } = useContext(ToastContext)
  const [loading, setLoading] = useState(false)
  const TranslateString = useI18n()

  const handleNormalError = useCallback(
    (error: any, tx?: TxResponse) => {
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: TranslateString('Failed', 'Failed'),
        description: TranslateString(
          'Please try again. Confirm the transaction and make sure you are paying enough gas!',
          'Please try again. Confirm the transaction and make sure you are paying enough gas!',
        ),
        type: toastTypes.DANGER,
      }
      logError(error)

      if (tx) {
        toast.action = {
          text: TranslateString('View on BscScan', 'View on BscScan'),
          url: getBscScanLink(tx.hash, 'transaction', defaultChainId),
        }
        addToast(toast)
      } else {
        addToast(toast)
        // console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')
      }
    },
    [addToast],
  )

  const fetchWithCatchTxError = useCallback(
    async (callTx: () => Promise<TxResponse>): Promise<TransactionReceipt | null> => {
      let tx: TxResponse = null
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: TranslateString('Success!', 'Success!'),
        description: TranslateString('Transaction Confirmed', 'Transaction Confirmed'),
        type: toastTypes.SUCCESS,
      }
      try {
        setLoading(true)

        /**
         * https://github.com/vercel/swr/pull/1450
         *
         * wait for useSWRMutation finished, so we could apply SWR in case manually trigger tx call
         */
        tx = await callTx()
        // console.log(tx, callTx)

        if (tx) {
          toast.action = {
            text: TranslateString('View on BscScan', 'View on BscScan'),
            url: getBscScanLink(tx.hash, 'transaction', defaultChainId),
          }
          addToast(toast)
        }
        if (tx) {
          const receipt = await tx.wait()
          if (receipt.status === 0) {
            toast.type = toastTypes.DANGER
            toast.title = TranslateString('Failed', 'Failed')
            toast.description = TranslateString('Oops, something wrong.', 'Oops, something wrong.')
            addToast(toast)
          }
          return receipt
        }
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error)
          } else {
            library
              .call(tx, tx.blockNumber)
              .then(() => {
                handleNormalError(error, tx)
              })
              .catch((err: any) => {
                console.log('err', err)
                if (isGasEstimationError(err)) {
                  handleNormalError(error, tx)
                } else {
                  logError(err)

                  let recursiveErr = err

                  let reason: string | undefined

                  // for MetaMask
                  if (recursiveErr?.data?.message) {
                    reason = recursiveErr?.data?.message
                  } else {
                    // for other wallets
                    // Reference
                    // https://github.com/Uniswap/interface/blob/ac962fb00d457bc2c4f59432d7d6d7741443dfea/src/hooks/useSwapCallback.tsx#L216-L222
                    while (recursiveErr) {
                      reason = recursiveErr.reason ?? recursiveErr.message ?? reason
                      recursiveErr = recursiveErr.error ?? recursiveErr.data?.originalError
                    }
                  }

                  const REVERT_STR = 'execution reverted: '
                  const indexInfo = reason?.indexOf(REVERT_STR)
                  if (indexInfo && reason) {
                    const isRevertedError = indexInfo >= 0
                    if (isRevertedError) reason = reason.substring(indexInfo + REVERT_STR.length)

                    if (tx) {
                      toast.action = {
                        text: TranslateString('View on BscScan', 'View on BscScan'),
                        url: getBscScanLink(tx.hash, 'transaction', defaultChainId),
                      }
                      toast.type = toastTypes.DANGER
                      toast.title = 'Failed'
                      toast.description = isRevertedError
                        ? TranslateString(
                            'Transaction failed with error: %reason%',
                            `Transaction failed with error: ${reason}`,
                          )
                        : TranslateString(
                            'Transaction failed. For detailed error message:',
                            'Transaction failed. For detailed error message:',
                          )
                      addToast(toast)
                    }
                  }
                }
              })
          }
        } else {
          toast.action = undefined
          toast.type = toastTypes.DANGER
          toast.title = TranslateString('Failed', 'Failed')
          toast.description = error.data?.message || error.message || 'User rejected'
          addToast(toast)
        }
      } finally {
        setLoading(false)
      }

      return null
    },
    [addToast, handleNormalError, library],
  )

  return {
    fetchWithCatchTxError,
    loading,
  }
}
