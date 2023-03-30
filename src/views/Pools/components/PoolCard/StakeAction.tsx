import React, { useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, useModal } from '@hulkfinance/hulk-uikit'
import { parseUnits } from '@ethersproject/units'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'
import useI18n from '../../../../hooks/useI18n'
import { formatBigNumber, getBalanceNumber, getFullDisplayBalance } from '../../../../utils/formatBalance'
import useStakePools from '../../../../hooks/Farms/useStakeFarms'
import useUnstakePools from '../../../../hooks/Farms/useUnstakeFarms'
import { PoolWithStakedValue } from '../../../../state/types'

interface PoolCardActionsProps {
  stakedBalance: BigNumber
  tokenBalance: BigNumber
  tokenName?: string
  pid: number
  depositFeeBP?: number
  pool: PoolWithStakedValue
}

const ButtonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
`

const StakeAction: React.FC<PoolCardActionsProps> = ({
  pool,
  stakedBalance,
  tokenBalance,
  tokenName,
  pid,
  depositFeeBP,
}) => {
  const TranslateString = useI18n()
  const { onStake } = useStakePools(pid)
  const { onUnstake } = useUnstakePools(pid)

  const rawStakedBalance = getBalanceNumber(stakedBalance)
  const displayStaked = useMemo(() => {
    const decimals = 18
    if (stakedBalance.isZero()) {
      return 0
    }
    const balance = getFullDisplayBalance(stakedBalance, pool.token.decimals, pool.token.decimals)
    const balanceUnits = parseUnits(balance, decimals)
    return +formatBigNumber(balanceUnits, decimals, decimals)
  }, [pool.token.decimals, stakedBalance])

  const [onPresentDeposit] = useModal(
    <DepositModal
      decimals={pool.token.decimals}
      max={tokenBalance}
      onConfirm={onStake}
      tokenName={tokenName}
      depositFeeBP={depositFeeBP}
    />,
  )
  const [onPresentWithdraw] = useModal(
    <WithdrawModal decimals={pool.token.decimals} max={stakedBalance} onConfirm={onUnstake} tokenName={tokenName} />,
  )

  return (
    <Flex justifyContent="space-between" flexDirection="column" alignItems="center">
      <Heading style={{ margin: '10px 0px' }} color={rawStakedBalance === 0 ? 'textDisabled' : 'text'}>
        {displayStaked.toFixed(3)}
      </Heading>
      <ButtonWrapper>
        <Button onClick={onPresentWithdraw}>{TranslateString('Withdraw', 'Withdraw')}</Button>
        <Button onClick={onPresentDeposit}>{TranslateString('Stake', 'Stake')}</Button>
      </ButtonWrapper>
    </Flex>
  )
}

export default StakeAction
