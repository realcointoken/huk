import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Card, CardBody, Heading, Skeleton, Text } from '@hulkfinance/hulk-uikit'
import CardValue from './CardValue'
import tvlImage from '../../../assets/images/TVL.png'
import useI18n from '../../../hooks/useI18n'
import { usePriceHulkBnb, usePriceHULKBusd, useTotalValue } from '../../../state/farms/hooks'
import { useTotalValue as useTotalValuePools } from '../../../state/pools/hooks'

const StyledTotalValueLockedCard = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`
const CardImage = styled.img`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  max-height: 208px;
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`

const TextItem = styled(Text)`
  font-size: 20px;
  line-height: 1.2;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  font-size: 20px;
  justify-content: space-between;
  margin-bottom: 16px;
`

const CardHeading = styled(Heading)`
  font-size: 24px;
  font-weight: 900;
`

const TotalValueLockedCard = () => {
  const TranslateString = useI18n()
  // const data = useGetStats()
  const totalValueFarms = useTotalValue()
  const totalValuePools = useTotalValuePools()
  const busdPrice = usePriceHULKBusd()
  const bnbPrice = usePriceHulkBnb()

  const [TVL, setTVL] = useState(0)

  useEffect(() => {
    const val = totalValueFarms.plus(totalValuePools)
    setTVL(val.toNumber())
  }, [totalValueFarms, totalValuePools])

  return (
    <StyledTotalValueLockedCard>
      <Card mb={40}>
        <CardBody p={40}>
          <CardHeading mb="16px">{TranslateString('TVL', 'TVL')}</CardHeading>
          <>
            <CardValue bold value={TVL} prefix="$" decimals={2} />
            <Text mt={16} color="primary" fontSize="20px" style={{ lineHeight: 1 }}>
              {TranslateString('Across all Farms and Pools', 'Across all Farms and Pools')}
            </Text>
            <CardImage src={tvlImage} alt="TVL" />
          </>
        </CardBody>
      </Card>
      <Card style={{ flex: 1 }}>
        <CardBody p={40}>
          <CardHeading mb="16px">HULK LP {TranslateString('Worth', 'Worth')}</CardHeading>
          <>
            <Row>
              <TextItem>HULK-BNB</TextItem>
              <TextItem>${bnbPrice.toNumber()}</TextItem>
            </Row>
            <Row>
              <TextItem>HULK-BUSD</TextItem>
              <TextItem>${busdPrice.toNumber()}</TextItem>
            </Row>
          </>
        </CardBody>
      </Card>
    </StyledTotalValueLockedCard>
  )
}

export default TotalValueLockedCard
