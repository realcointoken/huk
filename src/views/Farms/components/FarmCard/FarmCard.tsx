import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { keyframes } from 'styled-components'
import { Flex, Text, Skeleton, IconButton, CalculateIcon } from '@hulkfinance/hulk-uikit'
import DetailsSection from './DetailsSection'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'
import useI18n from '../../../../hooks/useI18n'
import ExpandableSectionButton from '../../../../components/ExpandableSectionButton'
import { FarmWithStakedValue } from '../../../../state/types'
import { defaultChainId } from '../../../../config'
import { getHULKTokenAddress } from '../../../../utils/addressHelpers'
import { dateFormat, getBscScanLink } from '../../../../utils'

const RainbowLight = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  background-size: 300% 300%;
  animation: ${RainbowLight} 2s linear infinite;
  border-radius: 16px;
  filter: blur(6px);
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
`

const FCard = styled.div`
  align-self: baseline;
  background: ${(props) => props.theme.card.background};
  border-radius: 32px;
  box-shadow: 0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
  position: relative;
  text-align: center;
`

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.borderColor};
  height: 1px;
  margin: 28px auto;
  width: 100%;
`

const ExpandingWrapper = styled.div<{ expanded: boolean }>`
  height: ${(props) => (props.expanded ? '100%' : '0px')};
  overflow: hidden;
`

const FarmText = styled(Text)`
  font-weight: 400;
  font-size: 20px;
  line-height: 1.2;
`

const Row = styled(Flex)`
  margin-bottom: 16px;
`

interface FarmCardProps {
  farm: FarmWithStakedValue
  removed: boolean
  hulkPrice?: BigNumber
  bnbPrice?: BigNumber
  displayApr: string
  account?: string | null
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, removed, hulkPrice, bnbPrice, account }) => {
  const TranslateString = useI18n()
  const [showExpandableSection, setShowExpandableSection] = useState(false)

  // const isCommunityFarm = communityFarms.includes(farm.tokenSymbol)
  // We assume the token name is coin pair + lp e.g. CAKE-BNB LP, LINK-BNB LP,
  // NAR-CAKE LP. The images should be hulk-bnb.svg, link-bnb.svg, nar-hulk.svg
  // const farmImage = farm.lpSymbol.split(' ')[0].toLocaleLowerCase()
  const farmImage = 'bnb-busd'

  const totalValueFormatted =
    farm.liquidity && farm.liquidity.gt(0)
      ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : ''

  const lpLabel = farm.lpSymbol
  const earnLabel = 'HULK'
  const farmAPY = parseInt(String(farm.apr || farm.defaultApr))

  const timeToHarvest = useMemo(() => {
    if (farm.userData?.nextHarvestUntil) {
      return dateFormat(new Date(farm.userData.nextHarvestUntil))
    }
    return '-'
  }, [farm.userData])
  // console.log(farm.token.symbol)
  return (
    <FCard>
      {farm.token.symbol === 'HULK' && <StyledCardAccent />}
      <CardHeading
        lpLabel={lpLabel}
        multiplier={farm.multiplier || '1x'}
        depositFee={farm.depositFeeBP}
        token0={farm.token.symbol || ''}
        token1={farm.quoteToken.symbol || ''}
      />
      {!removed && (
        <Row justifyContent="space-between" alignItems="center">
          <FarmText>{TranslateString('APR', 'APR')}:</FarmText>
          <FarmText style={{ display: 'flex', alignItems: 'center' }}>
            {farm.apr ? (
              <ApyButton
                variant="text-and-button"
                pid={farm.pid}
                lpSymbol={farm.lpSymbol}
                multiplier={farm.multiplier || '1x'}
                lpLabel={lpLabel}
                addLiquidityUrl=""
                hulkPrice={hulkPrice}
                apr={farmAPY}
                displayApr={farmAPY.toString()}
              />
            ) : (
              `${farmAPY.toString()}%`
            )}
          </FarmText>
        </Row>
      )}
      <Row justifyContent="space-between">
        <FarmText>{TranslateString('Earn', 'Earn')}:</FarmText>
        <FarmText>{earnLabel}</FarmText>
      </Row>
      <Row justifyContent="space-between">
        <FarmText>
          {TranslateString('Deposit', 'Deposit')} {TranslateString('Fees', 'Fees')}:
        </FarmText>
        <FarmText>{farm.depositFeeBP / 100}%</FarmText>
      </Row>
      <Row justifyContent="space-between">
        <FarmText>{TranslateString('Harvest Lockup:', 'Harvest Lockup:')}</FarmText>
        <FarmText>{timeToHarvest}</FarmText>
      </Row>
      <CardActionsContainer farm={farm} account={account} />
      <Divider />
      <ExpandableSectionButton
        onClick={() => setShowExpandableSection(!showExpandableSection)}
        expanded={showExpandableSection}
      />
      <ExpandingWrapper expanded={showExpandableSection}>
        <DetailsSection
          removed={removed}
          isTokenOnly={farm.token.address === getHULKTokenAddress()}
          bscScanAddress={
            farm.token.address === farm.quoteToken.address
              ? getBscScanLink(farm.token.address, 'token', defaultChainId)
              : getBscScanLink(farm.lpAddresses[defaultChainId], 'token', defaultChainId)
          }
          totalValueFormated={totalValueFormatted}
          lpLabel={lpLabel}
          quoteTokenAdresses={farm.quoteToken.address}
          quoteTokenSymbol={farm.quoteToken.symbol}
          tokenAddresses={farm.token.address}
        />
      </ExpandingWrapper>
    </FCard>
  )
}

export default FarmCard
// {/*{farmAPY}%*/}
// {/*<IconButton variant='text' ml='4px'>*/}
// {/*  <CalculateIcon width='18px' />*/}
// {/*</IconButton>*/}
