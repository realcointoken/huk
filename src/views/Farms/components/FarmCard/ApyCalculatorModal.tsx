import React from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Modal, Text, LinkExternal, Flex } from '@hulkfinance/hulk-uikit'
import getLiquidityUrlPathParts from '../../../../utils/getLiquidityUrlPathParts'
import useI18n from '../../../../hooks/useI18n'
import { apyModalRoi, calculateHulkEarnedPerThousandDollars } from '../../../../utils/compoundApyHelpers'

interface ApyCalculatorModalProps {
  onDismiss?: () => void
  lpLabel?: string
  hulkPrice: BigNumber
  apy: number
  quoteTokenAdresses?: string
  quoteTokenSymbol?: string
  tokenAddresses: string
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, auto);
  margin-bottom: 24px;
`

const GridItem = styled.div`
  margin-bottom: 10px;
`

const Description = styled(Text)`
  max-width: 320px;
  margin-bottom: 28px;
`

const ApyCalculatorModal: React.FC<ApyCalculatorModalProps> = ({
  onDismiss,
  lpLabel,
  quoteTokenAdresses,
  quoteTokenSymbol,
  tokenAddresses,
  hulkPrice,
  apy,
}) => {
  const TranslateString = useI18n()
  const liquidityUrlPathParts = getLiquidityUrlPathParts({ quoteTokenAdresses, quoteTokenSymbol, tokenAddresses })
  const farmApy = apy * 100
  const oneThousandDollarsWorthOfCake = !hulkPrice.isZero() ? 1000 / hulkPrice.toNumber() : 0

  const cakeEarnedPerThousand1D = calculateHulkEarnedPerThousandDollars({ numberOfDays: 1, farmApy, hulkPrice })
  const cakeEarnedPerThousand7D = calculateHulkEarnedPerThousandDollars({ numberOfDays: 7, farmApy, hulkPrice })
  const cakeEarnedPerThousand30D = calculateHulkEarnedPerThousandDollars({ numberOfDays: 30, farmApy, hulkPrice })
  const cakeEarnedPerThousand365D = calculateHulkEarnedPerThousandDollars({ numberOfDays: 365, farmApy, hulkPrice })

  return (
    <Modal title="ROI" onDismiss={onDismiss}>
      <Grid>
        <GridItem>
          <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase" mb="20px">
            {TranslateString('Timeframe', 'Timeframe')}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase" mb="20px">
            {TranslateString('ROI', 'ROI')}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase" mb="20px">
            {TranslateString('HULK per $1000', 'HULK per $1000')}
          </Text>
        </GridItem>
        {/* 1 day row */}
        <GridItem>
          <Text>1d</Text>
        </GridItem>
        <GridItem>
          <Text>
            {apyModalRoi({ amountEarned: cakeEarnedPerThousand1D, amountInvested: oneThousandDollarsWorthOfCake })}%
          </Text>
        </GridItem>
        <GridItem>
          <Text>{cakeEarnedPerThousand1D}</Text>
        </GridItem>
        {/* 7 day row */}
        <GridItem>
          <Text>7d</Text>
        </GridItem>
        <GridItem>
          <Text>
            {apyModalRoi({ amountEarned: cakeEarnedPerThousand7D, amountInvested: oneThousandDollarsWorthOfCake })}%
          </Text>
        </GridItem>
        <GridItem>
          <Text>{cakeEarnedPerThousand7D}</Text>
        </GridItem>
        {/* 30 day row */}
        <GridItem>
          <Text>30d</Text>
        </GridItem>
        <GridItem>
          <Text>
            {apyModalRoi({ amountEarned: cakeEarnedPerThousand30D, amountInvested: oneThousandDollarsWorthOfCake })}%
          </Text>
        </GridItem>
        <GridItem>
          <Text>{cakeEarnedPerThousand30D}</Text>
        </GridItem>
        {/* 365 day / APY row */}
        <GridItem>
          <Text>365d(APY)</Text>
        </GridItem>
        <GridItem>
          <Text>
            {apyModalRoi({ amountEarned: cakeEarnedPerThousand365D, amountInvested: oneThousandDollarsWorthOfCake })}%
          </Text>
        </GridItem>
        <GridItem>
          <Text>{cakeEarnedPerThousand365D}</Text>
        </GridItem>
      </Grid>
      <Description fontSize="12px" color="textSubtle">
        {TranslateString(
          'Calculated based on current rates. Compounding once daily. Rates are estimates provided for your convenience only, and by no means represent guaranteed returns.',
          'Calculated based on current rates. Compounding once daily. Rates are estimates provided for your convenience only, and by no means represent guaranteed returns.',
        )}
      </Description>
      <Flex justifyContent="center">
        <LinkExternal href={`https://exchange.hulkfiinance.finance/#/add/${liquidityUrlPathParts}`}>
          {TranslateString('Get', 'Get')} {lpLabel}
        </LinkExternal>
      </Flex>
    </Modal>
  )
}

export default ApyCalculatorModal
