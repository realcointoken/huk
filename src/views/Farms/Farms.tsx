import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Image, Heading } from '@hulkfinance/hulk-uikit'
import { ChainId } from '@hulkfinance/hulk-swap-sdk'
import { orderBy } from 'lodash'
import FarmTabButtons from './components/FarmTabButtons'
import useAuth from '../../hooks/useAuth'
import { useUserFarmStakedOnly, useUserFarmsViewMode } from '../../state/user/hooks'
import { TranslateString } from '../../utils/translateTextHelpers'
import { getFarmApr } from '../../utils/apr'
import { isArchivedPid } from '../../utils/farmHelpers'
import useIntersectionObserver from '../../hooks/useIntersectionObserver'
import { useFarms, usePollFarmsWithUserData, usePriceHULKBusd } from '../../state/farms/hooks'
import { latinise } from '../../utils/latinise'
import { FarmsContext } from '../../contexts/FarmContext'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import FlexLayout from '../../components/layout/Flex'
import Page from '../../components/layout/Page'
import FarmList from './FarmList'

export interface FarmsProps {
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

const Farms: React.FC<FarmsProps> = () => {
  const { login, logout } = useAuth()
  const { data: farmsLP, userDataLoaded, poolLength, regularHulkPerBlock } = useFarms()
  const hulkPrice = usePriceHULKBusd()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useUserFarmsViewMode()
  const { account } = useActiveWeb3React()
  const [sortOption, setSortOption] = useState('hot')
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const chosenFarmsLength = useRef(0)
  const [isActive, setIsActive] = useState<boolean>(true)

  usePollFarmsWithUserData(false)

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly(isActive)

  const activeFarms = farmsLP.filter(
    (farm: any) =>
      // farm.pid !== 0 && farm.multiplier !== '0X' && !isArchivedPid(farm.pid) && (!poolLength || poolLength > farm.pid),
      farm.multiplier !== '0X' && !isArchivedPid(farm.pid) && (!poolLength || poolLength > farm.pid),
  )

  const stakedOnlyFarms = activeFarms.filter(
    (farm: any) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const farmsList = useCallback(
    (farmsToDisplay) => {
      let farmsToDisplayWithAPR = farmsToDisplay.map((farm: any) => {
        if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) {
          return farm
        }
        // console.log(farm)
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteTokenPriceBusd)

        const { hulkRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(
              new BigNumber(farm.poolWeight),
              hulkPrice,
              totalLiquidity,
              farm.lpAddresses[ChainId.MAINNET],
              regularHulkPerBlock || 0,
            )
          : { hulkRewardsApr: 0, lpRewardsApr: 0 }

        return { ...farm, apr: hulkRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: any) => {
          return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery)
        })
      }
      return farmsToDisplayWithAPR
    },
    [hulkPrice, query, isActive, regularHulkPerBlock],
  )
  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)

  const chosenFarmsMemoized = useMemo(() => {
    let chosenFarms = []
    // console.log(isActive)
    const sortFarms = (farms: any) => {
      switch (sortOption) {
        case 'apr':
          return orderBy(farms, (farm: any) => farm.apr + farm.lpRewardsApr, 'desc')
        case 'multiplier':
          return orderBy(farms, (farm: any) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0), 'desc')
        case 'earned':
          return orderBy(farms, (farm: any) => (farm.userData ? Number(farm.userData.earnings) : 0), 'desc')
        case 'liquidity':
          return orderBy(farms, (farm: any) => Number(farm.liquidity), 'desc')
        case 'latest':
          return orderBy(farms, (farm: any) => Number(farm.pid), 'desc')
        default:
          return farms
      }
    }

    if (isActive) {
      chosenFarms = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    }
    // console.log(chosenFarms)
    return sortFarms(chosenFarms).slice(0, numberOfFarmsVisible)
  }, [sortOption, activeFarms, farmsList, isActive, stakedOnly, stakedOnlyFarms, numberOfFarmsVisible])

  chosenFarmsLength.current = chosenFarmsMemoized.length

  useEffect(() => {
    if (isIntersecting) {
      setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
        if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
          return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
        }
        return farmsCurrentlyVisible
      })
    }
  }, [isIntersecting])

  return (
    <FarmsContext.Provider value={{ chosenFarmsMemoized }}>
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
        <FarmTabButtons
          stakedOnly={stakedOnly}
          setStakedOnly={setStakedOnly}
          isActive={isActive}
          setIsActive={setIsActive}
        />
        <FarmList stakedOnly={stakedOnly} isActive={isActive} />
      </Page>
    </FarmsContext.Provider>
  )
}

export default Farms
