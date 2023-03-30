import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { keyframes } from 'styled-components'
import { Flex, Text, Skeleton } from '@hulkfinance/hulk-uikit'
import DetailsSection from './DetailsSection'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import useI18n from '../../../../hooks/useI18n'
import ExpandableSectionButton from '../../../../components/ExpandableSectionButton'
import { PoolWithStakedValue } from '../../../../state/types'
import { BIG_ZERO } from '../../../../utils/bigNumber'
import { defaultChainId } from '../../../../config'
import { getHULKTokenAddress } from '../../../../utils/addressHelpers'
import { dateFormat, getBscScanLink } from '../../../../utils'
import ApyButton from '../../../Farms/components/FarmCard/ApyButton'

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

const PoolText = styled(Text)`
  font-weight: 400;
  font-size: 20px;
  line-height: 1.2;
`

const Row = styled(Flex)`
  margin-bottom: 16px;
`

interface PoolCardProps {
  pool: PoolWithStakedValue
  removed: boolean
  hulkPrice?: BigNumber
  bnbPrice?: BigNumber
  displayApr: string
  account?: string | null
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, removed, hulkPrice, bnbPrice, account }) => {
  const TranslateString = useI18n()

  const [showExpandableSection, setShowExpandableSection] = useState(false)

  // const isCommunityPool = communityPools.includes(pool.tokenSymbol)
  // We assume the token name is coin pair + lp e.g. CAKE-BNB LP, LINK-BNB LP,
  // NAR-CAKE LP. The images should be hulk-bnb.svg, link-bnb.svg, nar-hulk.svg
  // const poolImage = pool.lpSymbol.split(' ')[0].toLocaleLowerCase()
  const poolImage = 'bnb-busd'

  const totalValueFormatted =
    pool.liquidity && pool.liquidity.gt(0)
      ? `$${pool.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : ''

  const lpLabel = pool.lpSymbol
  const earnLabel = 'HULK'
  const poolAPY = parseInt(String(pool.apr || pool.defaultApr))

  const timeToHarvest = useMemo(() => {
    if (pool.userData?.nextHarvestUntil) {
      return dateFormat(new Date(pool.userData.nextHarvestUntil))
    }
    return '-'
  }, [pool.userData])

  return (
    <FCard>
      {pool.token.symbol === 'HULK' && <StyledCardAccent />}
      <CardHeading
        lpLabel={lpLabel}
        multiplier={pool.multiplier || '1x'}
        depositFee={pool.depositFeeBP}
        token0={pool.token.symbol || ''}
        token1={pool.v1pid?.toString() || '1'}
      />
      {!removed && (
        <Row justifyContent="space-between" alignItems="center">
          <PoolText>{TranslateString('APR', 'APR')}:</PoolText>
          <PoolText style={{ display: 'flex', alignItems: 'center' }}>
            {pool.apr ? (
              <ApyButton
                variant="text-and-button"
                pid={pool.pid}
                lpSymbol={pool.lpSymbol}
                multiplier={pool.multiplier || '1x'}
                lpLabel={lpLabel}
                addLiquidityUrl=""
                hulkPrice={hulkPrice}
                apr={poolAPY}
                displayApr={poolAPY.toString()}
              />
            ) : (
              `${poolAPY.toString()}%`
            )}
          </PoolText>
        </Row>
      )}
      <Row justifyContent="space-between">
        <PoolText>{TranslateString('Earn', 'Earn')}:</PoolText>
        <PoolText>{earnLabel}</PoolText>
      </Row>
      <Row justifyContent="space-between">
        <PoolText>
          {TranslateString('Deposit', 'Deposit')} {TranslateString('Fees', 'Fees')}:
        </PoolText>
        <PoolText>{pool.depositFeeBP / 100}%</PoolText>
      </Row>
      <Row justifyContent="space-between">
        <PoolText>{TranslateString('Harvest Lockup:', 'Harvest Lockup:')}</PoolText>
        <PoolText>{timeToHarvest}</PoolText>
      </Row>
      <CardActionsContainer pool={pool} account={account} />
      <Divider />
      <ExpandableSectionButton
        onClick={() => setShowExpandableSection(!showExpandableSection)}
        expanded={showExpandableSection}
      />
      <ExpandingWrapper expanded={showExpandableSection}>
        <DetailsSection
          removed={removed}
          isTokenOnly={pool.token.address === getHULKTokenAddress()}
          bscScanAddress={
            pool.token.address === pool.quoteToken.address
              ? getBscScanLink(pool.token.address, 'token', defaultChainId)
              : getBscScanLink(pool.lpAddresses[defaultChainId], 'token', defaultChainId)
          }
          totalValueFormated={totalValueFormatted}
          lpLabel={lpLabel}
          quoteTokenAdresses={pool.quoteToken.address}
          quoteTokenSymbol={pool.quoteToken.symbol}
          tokenAddresses={pool.token.address}
        />
      </ExpandingWrapper>
    </FCard>
  )
}

export default PoolCard
