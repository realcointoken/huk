import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import styled from 'styled-components'
import { fromWei } from 'web3-utils'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useAppDispatch } from '../../../../state'
import { useHarvestFarm } from '../../../../hooks/Farms/useHarvestFarm'
import { ToastContext } from '../../../../contexts/ToastContext'
import useI18n from '../../../../hooks/useI18n'
import { getBalanceNumber, getFullDisplayBalance } from '../../../../utils/formatBalance'
import { FarmWithStakedValue } from '../../../../state/types'
import { getBscScanLink } from '../../../../utils'
import { defaultChainId } from '../../../../config'
import { fetchFarmUserDataAsync } from '../../../../state/farms'
import useActiveWeb3React from '../../../../hooks/useActiveWeb3React'

interface FarmCardActionsProps {
  earnings: BigNumber
  farm: FarmWithStakedValue
  pid: number
}

const BalanceAndCompound = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`

const Balance = styled(Heading)`
  font-size: 24px;
  word-break: break-all;
`

const HarvestAction: React.FC<FarmCardActionsProps> = ({ farm, earnings, pid }) => {
  const TranslateString = useI18n()
  const [pendingTx, setPendingTx] = useState(false)
  const { account } = useActiveWeb3React()
  const { fetchWithCatchTxError, loading } = useCatchTxError()

  const dispatch = useAppDispatch()
  const { addToast } = useContext(ToastContext)
  const rawEarningsBalance = useMemo(() => {
    return getBalanceNumber(earnings)
  }, [earnings])
  const displayBalance = useMemo(() => {
    return +fromWei(earnings.toString())
  }, [earnings])
  const { onReward } = useHarvestFarm(pid)
  const canHarvest: boolean = useMemo(() => {
    return farm.userData?.canHarvest || false
  }, [farm])
  const onHarvest = useCallback(async () => {
    setPendingTx(true)
    const receipt = await fetchWithCatchTxError(() => {
      return onReward()
    })
    if (receipt?.status) {
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: `Harvested`,
        description: `Your ${farm.token.symbol || 'DB'} earnings have been sent to your wallet!`,
        type: toastTypes.SUCCESS,
      }
      toast.action = {
        text: 'View transaction',
        url: getBscScanLink(receipt.transactionHash, 'transaction', defaultChainId),
      }
      addToast(toast)
      // @ts-ignore
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
    setPendingTx(false)
  }, [account, addToast, dispatch, farm.token.symbol, fetchWithCatchTxError, onReward, pid])

  return (
    <Flex mb="24px" mt={24} justifyContent="space-between" flexWrap="wrap" alignItems="center">
      <Balance color="#fff">{displayBalance.toFixed(3)}</Balance>
      <BalanceAndCompound>
        <Button disabled={rawEarningsBalance === 0 || pendingTx || !canHarvest} onClick={onHarvest}>
          {pendingTx ? TranslateString('Harvesting', 'Harvesting') : TranslateString('Harvest', 'Harvest')}
        </Button>
      </BalanceAndCompound>
    </Flex>
  )
}

export default HarvestAction
