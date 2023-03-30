/* eslint-disable react-hooks/exhaustive-deps */
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
import { getBalanceNumber } from '../../../../utils/formatBalance'
import { PoolWithStakedValue } from '../../../../state/types'
import { getBscScanLink } from '../../../../utils'
import { defaultChainId } from '../../../../config'
import { fetchPoolUserDataAsync } from '../../../../state/pools'
import useActiveWeb3React from '../../../../hooks/useActiveWeb3React'
import useStakePools from '../../../../hooks/Farms/useStakeFarms'

interface PoolCardActionsProps {
  earnings: BigNumber
  pool: PoolWithStakedValue
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
`

const Buttons = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
`

const HarvestAction: React.FC<PoolCardActionsProps> = ({ pool, earnings, pid }) => {
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
  const { onStake } = useStakePools(pid)
  const canHarvest: boolean = useMemo(() => {
    return pool.userData?.canHarvest || false
  }, [pool])
  const onHarvest = useCallback(async () => {
    setPendingTx(true)
    const receipt = await fetchWithCatchTxError(() => {
      return onReward()
    })
    if (receipt?.status) {
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: TranslateString('Harvested', 'Harvested'),
        description: TranslateString(
          'Your %symbol% earnings have been sent to your wallet!',
          `Your ${pool.token.symbol || 'DB'} earnings have been sent to your wallet!`,
        ),
        type: toastTypes.SUCCESS,
      }
      toast.action = {
        text: TranslateString('View on BscScan', 'View on BscScan'),
        url: getBscScanLink(receipt.transactionHash, 'transaction', defaultChainId),
      }
      addToast(toast)
      // @ts-ignore
      dispatch(fetchPoolUserDataAsync({ account, pids: [pid] }))
    }
    setPendingTx(false)
  }, [account, addToast, dispatch, pool.token.symbol, fetchWithCatchTxError, onReward, pid])

  const onStakeHandler = useCallback(async () => {
    setPendingTx(true)
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(rawEarningsBalance.toString())
    })
    if (receipt?.status) {
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: TranslateString('Stake', 'Stake'),
        description: `${TranslateString('Staked', 'Staked')} ${fromWei(earnings.toString())} ${pool.lpSymbol}!`,
        type: toastTypes.SUCCESS,
      }
      toast.action = {
        text: TranslateString('View on BscScan', 'View on BscScan'),
        url: getBscScanLink(receipt.transactionHash, 'transaction', defaultChainId),
      }
      addToast(toast)
    }
    setPendingTx(false)
  }, [addToast, earnings, fetchWithCatchTxError, onStake, pool.lpSymbol, rawEarningsBalance])

  return (
    <Flex mb="24px" mt={24} justifyContent="space-between" flexWrap="wrap" alignItems="center">
      <Balance color="#fff">{displayBalance.toFixed(3)}</Balance>

      <BalanceAndCompound>
        <Button
          disabled={rawEarningsBalance === 0 || pendingTx}
          size="sm"
          variant="secondary"
          marginBottom="15px"
          onClick={onStakeHandler}
        >
          {TranslateString('Compound', 'Compound')}
        </Button>
        <Button disabled={rawEarningsBalance === 0 || pendingTx || !canHarvest} onClick={onHarvest}>
          {pendingTx ? TranslateString('Harvesting', 'Harvesting') : TranslateString('Harvest', 'Harvest')}
        </Button>
      </BalanceAndCompound>
    </Flex>
  )
}

export default HarvestAction
