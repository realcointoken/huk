import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Link, LinkExternal } from '@hulkfinance/hulk-uikit'
import getLiquidityUrlPathParts from '../../../../utils/getLiquidityUrlPathParts'
import useI18n from '../../../../hooks/useI18n'

export interface ExpandableSectionProps {
  isTokenOnly?: boolean
  bscScanAddress?: string
  removed?: boolean
  totalValueFormated?: string
  lpLabel?: string
  quoteTokenAdresses?: string
  quoteTokenSymbol?: string
  tokenAddresses: string
}

const Wrapper = styled.div`
  margin-top: 24px;
`

const StyledLinkExternal = styled(LinkExternal)`
  text-decoration: none;
  font-weight: normal;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;

  svg {
    padding-left: 4px;
    height: 18px;
    width: auto;
    fill: ${({ theme }) => theme.colors.primary};
  }
`

const DetailText = styled(Text)`
  font-size: 20px;
  text-transform: uppercase;
  font-weight: normal;
`

const DetailsSection: React.FC<ExpandableSectionProps> = ({
  isTokenOnly,
  bscScanAddress,
  removed,
  totalValueFormated,
  lpLabel,
  quoteTokenAdresses,
  quoteTokenSymbol,
  tokenAddresses,
}) => {
  const TranslateString = useI18n()
  const liquidityUrlPathParts = getLiquidityUrlPathParts({ quoteTokenAdresses, quoteTokenSymbol, tokenAddresses })

  return (
    <Wrapper>
      <Flex justifyContent="space-between">
        <DetailText>{TranslateString('Stake', 'Stake')}:</DetailText>
        <StyledLinkExternal fontSize="20px" href={`https://pancakeswap.finance/add/${liquidityUrlPathParts}?chain=bsc`}>
          {lpLabel}
        </StyledLinkExternal>
      </Flex>
      {!removed && (
        <Flex justifyContent="space-between">
          <DetailText>{TranslateString('Total Liquidity', 'Total Liquidity')}:</DetailText>
          <DetailText>{totalValueFormated}</DetailText>
        </Flex>
      )}
      <Flex justifyContent="flex-start">
        <Link external href={bscScanAddress} fontSize="20px">
          {TranslateString('View on BscScan', 'View on BscScan')}
        </Link>
      </Flex>
    </Wrapper>
  )
}

export default DetailsSection
