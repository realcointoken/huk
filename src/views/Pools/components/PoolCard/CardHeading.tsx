import React from 'react'
import styled from 'styled-components'
import { Tag, Flex, Heading } from '@hulkfinance/hulk-uikit'
import { NoFeeTag } from '../../../../components/Tags'
import PairImage from './PairImage'

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  risk?: number
  depositFee?: number
  token0: string
  token1: string
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 0.25rem;
  }
`

const MultiplierTag = styled(Tag)`
  margin-left: 4px;
`

const CardHeading: React.FC<ExpandableSectionProps> = ({ lpLabel, multiplier, token0, token1, depositFee }) => {
  return (
    <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
      <PairImage token0={token0} token1={token1} />
      <Flex flexDirection="column" alignItems="flex-end">
        <Heading mb="4px">{lpLabel}</Heading>
        <Flex justifyContent="center">
          {depositFee === 0 ? <NoFeeTag /> : null}
          {/* {isCommunityPool ? <CommunityTag /> : <CoreTag />} */}
          {/* <RiskTag risk={risk} /> */}
          <MultiplierTag variant="primary">{multiplier}</MultiplierTag>
        </Flex>
      </Flex>
    </Wrapper>
  )
}

export default CardHeading
