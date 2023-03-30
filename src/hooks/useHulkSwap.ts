/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import { fromWei, toWei } from 'web3-utils'
import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import useActiveWeb3React from './useActiveWeb3React'
import { useHulkContract, useHulkPreContract, useHulkSwapContract } from './useContract'
import { getHULKSwapAddress } from '../utils/addressHelpers'
import { ToastContext } from '../contexts/ToastContext'
import { escapeRegExp, getBscScanLink, inputRegex, shortBalance } from '../utils'
import useBlockNumber from './useBlockNumber'
import { defaultChainId } from '../config'
import useI18n from './useI18n'

const BN_0 = BigNumber.from('0')

export default function useHulkSwap() {
  const { account } = useActiveWeb3React()
  const { addToast } = useContext(ToastContext)
  const hulkSwapContract = useHulkSwapContract()
  const hulkPreContract = useHulkPreContract()
  const hulkContract = useHulkContract()
  const [pending, setPending] = useState<boolean>(false)
  const [pendingApprove, setPendingApprove] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')

  const [hulkBalance, setHulkBalance] = useState<BigNumber>(BN_0)
  const [hulkPreBalance, setHulkPreBalance] = useState<BigNumber>(BN_0)
  const [allowance, setAllowance] = useState<BigNumber>(BN_0)
  const block = useBlockNumber()
  const TranslateString = useI18n()

  const getData = useCallback(() => {
    if (account) {
      if (hulkPreContract) {
        hulkPreContract
          .balanceOf(account)
          .then((res: string) => {
            setHulkPreBalance(BigNumber.from(res))
          })
          .catch((e: any) => console.log(e))
        hulkPreContract
          .allowance(account, getHULKSwapAddress())
          .then((res: string) => {
            setAllowance(BigNumber.from(res))
          })
          .catch((e: any) => console.log(e))
      }
      if (hulkContract) {
        hulkContract
          .balanceOf(account)
          .then((res: string) => {
            setHulkBalance(BigNumber.from(res))
          })
          .catch((e: any) => console.log(e))
      }
    }
  }, [account, hulkContract, hulkPreContract])

  useEffect(() => {
    getData()
  }, [getData, block])

  const onChangeAmountIn = useCallback(
    async (value: string) => {
      let nextUserInput = value.replace(/,/g, '.')
      const maxBalance = fromWei(hulkPreBalance.toString())
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        nextUserInput = parseFloat(nextUserInput) > parseFloat(maxBalance) ? maxBalance.toString() : nextUserInput
        setAmount(nextUserInput)
        setAmountOut(nextUserInput)
      }
    },
    [hulkPreBalance],
  )

  const onChangeAmountOut = useCallback(
    async (value: string) => {
      let nextUserInput = value.replace(/,/g, '.')
      const maxBalance = fromWei(hulkPreBalance.toString())
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        nextUserInput = parseFloat(nextUserInput) > parseFloat(maxBalance) ? maxBalance.toString() : nextUserInput
        setAmountOut(nextUserInput)
        setAmount(nextUserInput)
      }
    },
    [hulkPreBalance],
  )

  const onSwap = useCallback(async () => {
    if (hulkSwapContract) {
      const now = Date.now()
      const toast: Toast = {
        id: `id-${now}`,
        title: TranslateString('Success!', 'Success!'),
        description: `${TranslateString('Confirm Swap', 'Confirm Swap')} ${amount} HULKPre to ${amountOut} HULK!`,
        type: toastTypes.SUCCESS,
      }
      setPending(true)
      const trx = await hulkSwapContract
        .swap(toWei(amount), { from: account })
        .catch((e: any) => {
          toast.title = TranslateString('Failed', 'Failed')
          toast.type = toastTypes.DANGER
          toast.description =
            e.receipt !== undefined ? TranslateString('Oops, something wrong.', 'Oops, something wrong.') : e.message
        })
        .finally(() => {
          setPending(false)
          getData()
        })
      if (trx?.hash) {
        toast.action = {
          text: TranslateString('View on BscScan', 'View on BscScan'),
          url: `https://testnet.bscscan.com/tx/${trx.hash}`,
        }
      }
      addToast(toast)
    }
  }, [hulkSwapContract, amount, amountOut, account, addToast, getData])

  const onApprove = useCallback(async () => {
    if (account) {
      const now = Date.now()
      const toast: Toast = {
        id: `id-${now}`,
        title: TranslateString('Success!', 'Success!'),
        description: TranslateString('Transaction Confirmed', 'Transaction Confirmed'),
        type: toastTypes.SUCCESS,
      }
      setPendingApprove(true)
      if (hulkPreContract && account) {
        return hulkPreContract
          .approve(getHULKSwapAddress(), MaxUint256, { from: account })
          .then((res: TransactionResponse) => {
            //  console.log(res.hash)

            if (res?.hash) {
              toast.action = {
                text: TranslateString('View on BscScan', 'View on BscScan'),
                url: getBscScanLink(res.hash, 'transaction', defaultChainId),
              }
            }
            addToast(toast)
          })
          .catch((error: any) => {
            toast.title = TranslateString('Failed', 'Failed')
            toast.type = toastTypes.DANGER
            toast.description = error.data?.message || error.message || 'Something went wrong!'
            addToast(toast)
          })
          .finally(() => setPendingApprove(false))
      }
      setPendingApprove(false)
      getData()
    }
  }, [account, addToast, getData, hulkPreContract])

  return useMemo(() => {
    return {
      allowance,
      hulkBalance,
      hulkPreBalance,
      onApprove,
      pending,
      pendingApprove,
      onSwap,
      onChangeAmountIn,
      onChangeAmountOut,
      amount,
      amountOut,
    }
  }, [
    allowance,
    hulkBalance,
    hulkPreBalance,
    onApprove,
    pending,
    pendingApprove,
    onSwap,
    onChangeAmountIn,
    onChangeAmountOut,
    amount,
    amountOut,
  ])
}
