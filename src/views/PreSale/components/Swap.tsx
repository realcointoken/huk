import React, { useMemo } from 'react'
import styled from 'styled-components'
import { fromWei } from 'web3-utils'
import { Button, Card, CardBody, Flex, Heading, Input, Text } from '@hulkfinance/hulk-uikit'
import hulk from '../../../assets/images/HulkLogo.svg'
import UnlockButton from '../../../components/UnlockButton'
import { shortBalance } from '../../../utils'
import useHulkSwap from '../../../hooks/useHulkSwap'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'

const SwapStyledCard = styled(Card)`
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
  overflow: visible;

  & > div {
    border-radius: 32px;
    background-color: ${({ theme }) => theme.colors.card};
    position: relative;
    height: 100%;
  }

  &:before {
    content: '';
    z-index: -1;
    display: block;
    position: absolute;
    top: -7px;
    right: -7px;
    bottom: -7px;
    left: -7px;
    background: linear-gradient(90deg, #ffffff 0%, #faff00 51.87%, #3cbd0e 100%);
    filter: blur(10px);
    border-radius: 32px;
  }
`

const CardHeading = styled(Heading)`
  font-size: 28px;
  font-weight: 900;
  @media (min-width: 768px) {
    font-size: 40px;
  }
`

const SwapText = styled(Text)`
  font-size: 20px;
  margin-bottom: 12px;
  word-break: break-all;

  span {
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.tertiary};
  }
`

const Logo = styled.img`
  width: 80px;
  height: 80px;
  position: absolute;
  top: 24px;
  right: 40px;
  z-index: 1;
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`

const SwapBlock = styled.div`
  display: flex;
  align-content: center;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 32px;
  flex-direction: column-reverse;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`

const AmountInput = styled(Input)`
  max-width: 100%;
  padding: 12px 16px;
  height: 48px;
  width: 100%;
  margin: 0;

  @media (min-width: 768px) {
    margin-top: 8px;
  }
`
const Amount = styled.div`
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  @media (min-width: 768px) {
    align-content: flex-start;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: row;
  }
`

const ButtonBlock = styled(Flex)`
  margin-top: 56px;
`

const InputBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin: 8px 0 0;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  @media (min-width: 768px) {
    width: calc(50% - 16px);
    margin: 0 8px;
  }
`

function Swap() {
  const { account } = useActiveWeb3React()

  const {
    allowance,
    hulkBalance,
    hulkPreBalance,
    pendingApprove,
    pending,
    onApprove,
    onSwap,
    amountOut,
    onChangeAmountIn,
    onChangeAmountOut,
    amount,
  } = useHulkSwap()

  const isDisabled = useMemo(() => {
    return allowance.isZero() || pending || amount === '' || !account
  }, [account, allowance, amount, pending])

  return (
    <SwapStyledCard>
      <Logo src={hulk} alt="Hulk" />
      <CardBody p={40}>
        <CardHeading mb="24px">Swap</CardHeading>
        <SwapText>
          <span>HULK token</span> will be distributed block by block from Feb 4th, 2022 ( 30% each month)
        </SwapText>
        <SwapBlock>
          <Amount>
            <InputBlock>
              <SwapText>HULKPre</SwapText>
              <SwapText>Balance: {shortBalance(fromWei(hulkPreBalance.toString()), 4)}</SwapText>
              <AmountInput
                type="text"
                scale="md"
                value={amount}
                onChange={(event) => onChangeAmountIn(event.target.value)}
                placeholder="0.000000"
              />
            </InputBlock>
            <InputBlock>
              <SwapText>HULK</SwapText>
              <SwapText>Balance: {shortBalance(fromWei(hulkBalance.toString()), 4)}</SwapText>
              <AmountInput
                type="text"
                scale="md"
                value={amountOut}
                onChange={(event) => onChangeAmountOut(event.target.value)}
                placeholder="0.000000"
              />
            </InputBlock>
          </Amount>
        </SwapBlock>
        <ButtonBlock justifyContent="space-between">
          {/* eslint-disable-next-line no-nested-ternary */}
          {account ? (
            allowance.isZero() ? (
              <Button variant="primary" onClick={onApprove} fullWidth disabled={pendingApprove}>
                {pendingApprove ? 'Wait' : 'Approve'}
              </Button>
            ) : (
              <Button onClick={onSwap} fullWidth disabled={isDisabled} variant="primary">
                {pending ? 'Wait' : 'Swap hulk'}
              </Button>
            )
          ) : (
            <UnlockButton fullWidth />
          )}
        </ButtonBlock>
      </CardBody>
    </SwapStyledCard>
  )
}

export default Swap
