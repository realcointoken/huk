import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Image, Heading } from '@hulkfinance/hulk-uikit'
import { ChainId } from '@hulkfinance/hulk-swap-sdk'
import { orderBy } from 'lodash'
import PoolTabButtons from './components/PoolTabButtons'
import useAuth from '../../hooks/useAuth'
import { useUserPoolStakedOnly, useUserPoolsViewMode } from '../../state/user/hooks'
import { TranslateString } from '../../utils/translateTextHelpers'
import { getFarmApr, getPoolApr } from '../../utils/apr'
import { isArchivedPid } from '../../utils/farmHelpers'
import useIntersectionObserver from '../../hooks/useIntersectionObserver'
import { usePools, usePollPoolsWithUserData, usePriceHULKBusd } from '../../state/pools/hooks'
import { latinise } from '../../utils/latinise'
import { PoolsContext } from '../../contexts/PoolContext'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import FlexLayout from '../../components/layout/Flex'
import Page from '../../components/layout/Page'
import PoolList from './PoolList'

export interface PoolsProps {
  tokenMode?: boolean
}

const NUMBER_OF_FARMS_VISIBLE = 12

const getDisplayApr = (cakeRewardsApr: any, lpRewardsApr: any) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

const Banner = styled.div`
  width: 100%;
  height: 186px;
  //background-image: url('../../assets/images/home_banner.png');
  background: url('/images/PageBanner.png');
  background-repeat: no-repeat;
  background-position: top center;
  background-size: auto 100%;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const BannerHeading = styled(Heading)`
  font-size: 48px;
  font-weight: 900;
  line-height: 1.2;
`

const Pools: React.FC<PoolsProps> = () => {
  const { login, logout } = useAuth()
  const { data: poolsLP, userDataLoaded, poolLength, regularHulkPerBlock } = usePools()
  const umPrice = usePriceHULKBusd()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useUserPoolsViewMode()
  const { account } = useActiveWeb3React()
  const [sortOption, setSortOption] = useState('hot')
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const chosenPoolsLength = useRef(0)
  const [isActive, setIsActive] = useState<boolean>(true)

  usePollPoolsWithUserData(false)

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserPoolStakedOnly(isActive)

  const activePools = poolsLP.filter(
    (pool: any) =>
      // pool.pid !== 0 && pool.multiplier !== '0X' && !isArchivedPid(pool.pid) && (!poolLength || poolLength > pool.pid),
      pool.multiplier !== '0X' && !isArchivedPid(pool.pid) && (!poolLength || poolLength > pool.pid),
  )

  const stakedOnlyPools = activePools.filter(
    (pool: any) => pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0),
  )

  const poolsList = useCallback(
    (poolsToDisplay) => {
      let poolsToDisplayWithAPR = poolsToDisplay.map((pool: any) => {
        if (!pool.lpTotalInQuoteToken || !pool.quoteTokenPriceBusd) {
          return pool
        }
        const totalLiquidity = new BigNumber(pool.lpTotalInQuoteToken).times(pool.quoteTokenPriceBusd)
        const { hulkRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(
              new BigNumber(pool.poolWeight),
              umPrice,
              totalLiquidity,
              pool.lpAddresses[ChainId.BSCTESTNET],
              regularHulkPerBlock || 0,
            )
          : { hulkRewardsApr: 0, lpRewardsApr: 0 }

        return { ...pool, apr: hulkRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        poolsToDisplayWithAPR = poolsToDisplayWithAPR.filter((pool: any) => {
          return latinise(pool.lpSymbol.toLowerCase()).includes(lowercaseQuery)
        })
      }
      return poolsToDisplayWithAPR
    },
    [umPrice, query, isActive, regularHulkPerBlock],
  )
  const [numberOfPoolsVisible, setNumberOfPoolsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)

  const chosenPoolsMemoized = useMemo(() => {
    let chosenPools = []

    const sortPools = (pools: any) => {
      switch (sortOption) {
        case 'apr':
          return orderBy(pools, (pool: any) => pool.apr + pool.lpRewardsApr, 'desc')
        case 'multiplier':
          return orderBy(pools, (pool: any) => (pool.multiplier ? Number(pool.multiplier.slice(0, -1)) : 0), 'desc')
        case 'earned':
          return orderBy(pools, (pool: any) => (pool.userData ? Number(pool.userData.earnings) : 0), 'desc')
        case 'liquidity':
          return orderBy(pools, (pool: any) => Number(pool.liquidity), 'desc')
        case 'latest':
          return orderBy(pools, (pool: any) => Number(pool.pid), 'desc')
        default:
          return pools
      }
    }

    if (isActive) {
      chosenPools = stakedOnly ? poolsList(stakedOnlyPools) : poolsList(activePools)
    }
    return sortPools(chosenPools).slice(0, numberOfPoolsVisible)
  }, [sortOption, activePools, poolsList, isActive, stakedOnly, stakedOnlyPools, numberOfPoolsVisible])

  chosenPoolsLength.current = chosenPoolsMemoized.length

  useEffect(() => {
    if (isIntersecting) {
      setNumberOfPoolsVisible((poolsCurrentlyVisible) => {
        if (poolsCurrentlyVisible <= chosenPoolsLength.current) {
          return poolsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
        }
        return poolsCurrentlyVisible
      })
    }
  }, [isIntersecting])

  return (
    <PoolsContext.Provider value={{ chosenPoolsMemoized }}>
      <Banner>
        <BannerHeading as="h1" mb={0} style={{ textAlign: 'center' }}>
          {TranslateString('Stake', 'Stake')} {TranslateString('Tokens', 'Tokens')} {TranslateString('to', 'to')}{' '}
          {TranslateString('Earn', 'Earn')} HULK
        </BannerHeading>
        <Heading as="h2" color="primary" mt="16px" style={{ textAlign: 'center' }}>
          {TranslateString('Stake', 'Stake')} {TranslateString('Tokens', 'Tokens')} {TranslateString('to', 'to')}{' '}
          {TranslateString('Earn', 'Earn')} HULK
        </Heading>
      </Banner>
      <Page>
        <PoolTabButtons
          stakedOnly={stakedOnly}
          setStakedOnly={setStakedOnly}
          isActive={isActive}
          setIsActive={setIsActive}
        />
        <PoolList />
      </Page>
    </PoolsContext.Provider>
  )
}

export default Pools
