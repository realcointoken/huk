/* eslint-disable react-hooks/exhaustive-deps */
import BigNumber from 'bignumber.js'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { Button, Modal, Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import useI18n from '../../../hooks/useI18n'
import TokenInput from '../../../components/TokenInput'
import { getFullDisplayBalance } from '../../../utils/formatBalance'
import ModalActions from '../../../components/ModalActions'
import useCatchTxError from '../../../hooks/useCatchTxError'
import { ToastContext } from '../../../contexts/ToastContext'
import { getBscScanLink } from '../../../utils'
import { defaultChainId } from '../../../config'
import PercentButtons from '../../../components/Input/PercentButtons'

interface DepositModalProps {
  max: BigNumber
  onConfirm: any
  onDismiss?: () => void
  tokenName?: string
  depositFeeBP?: number
  decimals: number
}

const DepositModal: React.FC<DepositModalProps> = ({
  max,
  decimals,
  onConfirm,
  onDismiss,
  tokenName = '',
  depositFeeBP = 0,
}) => {
  const [val, setVal] = useState('')
  const [pendingTx, setPendingTx] = useState(false)
  const TranslateString = useI18n()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max, decimals, decimals)
  }, [decimals, max])

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])
  const handleSelectPercent = useCallback(
    (percent: number) => {
      setVal(getFullDisplayBalance(max.multipliedBy(percent).div(100), decimals, decimals))
    },
    [decimals, max],
  )
  const { fetchWithCatchTxError } = useCatchTxError()
  const { addToast } = useContext(ToastContext)
  const onStake = useCallback(async () => {
    setPendingTx(true)
    const receipt = await fetchWithCatchTxError(() => {
      return onConfirm(val)
    })
    if (receipt?.status) {
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: TranslateString('Stake', 'Stake'),
        description: `${TranslateString('Staked', 'Staked')} ${val} ${tokenName}!`,
        type: toastTypes.SUCCESS,
      }
      toast.action = {
        text: TranslateString('View on BscScan', 'View on BscScan'),
        url: getBscScanLink(receipt.transactionHash, 'transaction', defaultChainId),
      }
      addToast(toast)
    }

    if (onDismiss) {
      onDismiss()
    }
    setPendingTx(false)
  }, [addToast, fetchWithCatchTxError, onConfirm, onDismiss, tokenName, val])

  return (
    <Modal title={`${TranslateString('Deposit', 'Deposit')} ${tokenName} Tokens`} onDismiss={onDismiss}>
      <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
        depositFeeBP={depositFeeBP}
      />
      <PercentButtons handleSelectPercent={handleSelectPercent} />
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss}>
          {TranslateString('Cancel', 'Cancel')}
        </Button>
        <Button disabled={pendingTx} onClick={onStake}>
          {pendingTx ? TranslateString('Confirming...', 'Confirming...') : TranslateString('Confirm', 'Confirm')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default DepositModal
