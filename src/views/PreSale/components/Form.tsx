import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { fromWei } from 'web3-utils'
import { Button, Card, CardBody, Flex, Heading, Input, Text } from '@hulkfinance/hulk-uikit'
import hulk from '../../../assets/images/HulkLogo.svg'
import UnlockButton from '../../../components/UnlockButton'
import { shortBalance } from '../../../utils'
import usePresale, { ECoins } from '../../../hooks/usePresale'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'

const FormStyledCard = styled(Card)`
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

const FormText = styled(Text)`
  font-size: 20px;
  margin-top: 8px;
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

const Progress = styled.div<{ width: number }>`
  //background: linear-gradient(90deg, rgba(255, 255, 255, 0.5) 0%, rgba(250, 255, 0, 0.5) 51.87%, rgba(60, 189, 14, 0.5) 100%);
  background: ${({ width }) =>
    `linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) ${width}%, rgba(255, 255, 255, .5) ${width}%, rgba(250, 255, 0, 0.5) ${
      (100 - width) / 2
    }%, rgba(60, 189, 14, 0.5) 100%)`};
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 44px;
  margin-top: 43px;

  div {
    color: ${({ theme, width }) => (width < 50 ? '#fff' : theme.colors.primary)};
    text-align: center;
    position: relative;
    font-size: 20px;
    line-height: 24px;
    text-transform: capitalize;
  }
`

const FormBlock = styled.div`
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

  @media (min-width: 768px) {
    max-width: 160px;
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
    width: unset;
  }
`
const BalanceBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 16px;
  width: 100%;
  @media (min-width: 768px) {
    margin-top: 0;
    width: unset;
  }
`

const BalanceButton = styled.div`
  width: 100%;
  display: flex;
  align-content: flex-start;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: 12px;
  @media (min-width: 768px) {
    margin-top: 0;
    width: unset;
  }
`
const MaxButton = styled(Button)`
  margin-left: 20px;
`

const Select = styled.select`
  width: 100px;
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text};
  display: block;
  height: 48px;
  outline: 0;
  padding: 4px 16px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  font-size: 20px;
  line-height: 1.2;

  &::placeholder {
    color: ${({ theme }) => theme.colors.tertiary};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundDisabled};
    box-shadow: none;
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }

  &:focus:not(:disabled) {
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }

  @media (min-width: 768px) {
    width: 140px;
  }
`

const ButtonBlock = styled(Flex)`
  margin-top: 56px;

  button {
    max-width: 220px;
    width: 100%;
  }
`

function Form() {
  const { account } = useActiveWeb3React()

  const {
    onBuyTokens,
    coin,
    onSelectCoin,
    round,
    pending,
    balance,
    onChangeAmountIn,
    amountIn,
    onMax,
    onApprove,
    allowance,
    pendingApprove,
    percent,
    amountOut,
    onChangeAmountOut,
  } = usePresale()

  const renderCoinSymbol = useCallback(() => {
    switch (coin) {
      case ECoins.Zero:
        return 'BNB'
      case ECoins.BUSD:
        return 'BUSD'
      case ECoins.USDT:
        return 'USDT'
      default:
        return 'BNB'
    }
  }, [coin])
  const isDisabled = useMemo(() => {
    return (
      (coin !== ECoins.Zero && allowance[coin === ECoins.BUSD ? 'busd' : 'usdt'].isZero()) || pending || amountIn === ''
    )
  }, [allowance, amountIn, coin, pending])
  return (
    <FormStyledCard>
      <Logo src={hulk} alt="Hulk" />
      <CardBody p={40}>
        <CardHeading mb="24px">IDO ROUND {round + 1}</CardHeading>
        <Progress width={percent}>
          <div>{percent}%</div>
        </Progress>
        <FormText>
          <span>HULK token</span> will be distributed block by block from Feb 4th, 2022 ( 30% each month)
        </FormText>
        {/* <ReferralButton variant='text'>Referral link <img src={copy} alt='Copy' /></ReferralButton> */}
        <FormBlock>
          <Amount>
            <FormText>Amount In</FormText>
            <AmountInput
              type="text"
              scale="md"
              value={amountIn}
              onChange={(event) => onChangeAmountIn(event.target.value)}
              placeholder="0.000000"
            />
            <FormText>HULKPre</FormText>
            <AmountInput
              type="text"
              scale="md"
              value={amountOut}
              onChange={(event) => onChangeAmountOut(event.target.value)}
              placeholder="0.000000"
            />
            {/* {!tokensAmount.isZero() && <FormText mt="8px"><span>HULK token:</span><br/> {fromWei(tokensAmount.toString())}</FormText>} */}
          </Amount>
          <BalanceBlock>
            <FormText>
              Balance: {shortBalance(fromWei(balance.toString()))} {renderCoinSymbol()}
            </FormText>
            <BalanceButton>
              <Select value={coin} onChange={(event) => onSelectCoin(event.target.value)}>
                <option value={ECoins.Zero}>BNB</option>
                <option value={ECoins.BUSD}>BUSD</option>
                <option value={ECoins.USDT}>USDT</option>
              </Select>
              <MaxButton onClick={onMax} size="md" variant="primary">
                Max
              </MaxButton>
            </BalanceButton>
          </BalanceBlock>
        </FormBlock>
        <ButtonBlock justifyContent="space-between">
          {account ? (
            <>
              {coin !== ECoins.Zero && (
                <Button
                  variant="primary"
                  onClick={onApprove}
                  disabled={!allowance[coin === ECoins.BUSD ? 'busd' : 'usdt'].isZero() || pendingApprove}
                >
                  {pendingApprove ? 'Wait' : 'Approve'}
                </Button>
              )}
              <Button onClick={onBuyTokens} fullWidth={coin === ECoins.Zero} disabled={isDisabled} variant="primary">
                {pending ? 'Wait' : 'Buy HULK'}
              </Button>
            </>
          ) : (
            <UnlockButton fullWidth />
          )}
        </ButtonBlock>
      </CardBody>
    </FormStyledCard>
  )
}

export default Form
