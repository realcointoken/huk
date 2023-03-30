/* eslint-disable no-unneeded-ternary */
import React, { useEffect, useState } from 'react'
import { Card, CardBody, Heading, Text } from '@hulkfinance/hulk-uikit'
import BigNumber from 'bignumber.js/bignumber'
import styled from 'styled-components'
import CardValue from './CardValue'
import { usePriceHULKBusd, useTotalValue } from '../../../state/farms/hooks'
import useI18n from '../../../hooks/useI18n'
import { getBalanceNumber } from '../../../utils/formatBalance'
import { useBurnedBalance, useMaxTxAmount, useTotalSupply } from '../../../hooks/useTokenBalance'
import { getHULKTokenAddress } from '../../../utils/addressHelpers'
import { useTotalValue as useTotalValuePools } from '../../../state/pools/hooks'
import { BIG_ZERO } from '../../../utils/bigNumber'
import { useHulkPerBlock, useRemainRewards } from '../../../hooks/useMasterChef'

const StyledCakeStats = styled(Card)`
  margin-left: auto;
  margin-right: auto;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`

const CardHeading = styled(Heading)`
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 24px;
  @media (min-width: 768px) {
    font-size: 40px;
  }
`

const TextItem = styled(Text)`
  font-size: 20px;
  line-height: 1.2;
`

const CakeStats = () => {
  const TranslateString = useI18n()
  const totalSupply = useTotalSupply()
  const burnedBalance = useBurnedBalance(getHULKTokenAddress())
  const eggPrice = usePriceHULKBusd()
  const circSupply = totalSupply ? totalSupply.minus(burnedBalance) : new BigNumber(0)
  const hulkSupply = getBalanceNumber(circSupply)
  const marketCap = eggPrice.times(circSupply)
  const maxTxAmount = useMaxTxAmount()

  const totalValueFarms = useTotalValue()
  const totalValuePools = useTotalValuePools()

  const [TVL, setTVL] = useState(0)

  useEffect(() => {
    // console.log('TVL')
    const val = totalValueFarms.plus(totalValuePools)
    setTVL(val.toNumber())
  }, [totalValueFarms, totalValuePools])

  const hulkPerBlock = useHulkPerBlock()
  const hulkPerDay = hulkPerBlock?.times(7200)

  const remainRewards = useRemainRewards()

  // const hulkPerBlock = BIG_ZERO

  // const remainRewards = BIG_ZERO

  return (
    <StyledCakeStats>
      <CardBody p={40}>
        <CardHeading bold>{TranslateString('HULK Stats', 'HULK Stats')}</CardHeading>
        <Row>
          <TextItem>{TranslateString('Market cap', 'Market Cap')}</TextItem>
          <CardValue fontSize="20px" value={getBalanceNumber(marketCap)} decimals={0} prefix="$" />
        </Row>
        <Row>
          <TextItem>{TranslateString('Total supply', 'Total Supply')}</TextItem>
          <CardValue fontSize="20px" value={hulkSupply ? hulkSupply : 0} decimals={0} />
        </Row>
        <Row>
          <TextItem>{TranslateString('Total burned', 'Total Burned')}</TextItem>
          <CardValue fontSize="20px" value={burnedBalance ? getBalanceNumber(burnedBalance) : 0} decimals={0} />
        </Row>
        <Row>
          <TextItem>{TranslateString('Total locked', 'Total Locked')}</TextItem>
          <CardValue fontSize="20px" value={TVL} decimals={0} />
        </Row>
        <Row>
          <TextItem>{TranslateString('Circulating Supply', 'Circulating Supply')}</TextItem>
          <CardValue fontSize="20px" value={circSupply ? getBalanceNumber(circSupply) : 0} decimals={0} />
        </Row>
        <Row>
          <TextItem>{TranslateString('Un-mined', 'Un-mined')}</TextItem>
          <CardValue fontSize="20px" value={remainRewards ? getBalanceNumber(remainRewards) : 0} decimals={0} />
        </Row>
        <Row>
          <TextItem>{TranslateString('Mining /24h', 'Mining /24h')}</TextItem>
          <CardValue fontSize="20px" value={hulkPerDay ? getBalanceNumber(hulkPerDay) : 0} decimals={0} />
        </Row>
        <Row>
          <TextItem>
            {TranslateString('Max', 'Max')} Tx {TranslateString('Amount', 'Amount')}
          </TextItem>

          <CardValue fontSize="20px" value={maxTxAmount ? getBalanceNumber(maxTxAmount) : 0} decimals={0} />

          {/* <TextItem>{maxTxAmount ? getBalanceNumber(maxTxAmount) : 0}</TextItem> */}
          {/* <TextItem >{mashPerBlock}</TextItem> */}
        </Row>
      </CardBody>
    </StyledCakeStats>
  )
}

export default CakeStats
