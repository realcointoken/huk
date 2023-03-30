import React, { useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import { usePriceHULKBusd } from '../../state/farms/hooks'
import { FarmsContext } from '../../contexts/FarmContext'
import FarmCard from './components/FarmCard/FarmCard'
import FlexLayout from '../../components/layout/Flex'
import farms from '../../config/constants/farms'

const getDisplayApr = (cakeRewardsApr: any, lpRewardsApr: any) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}
function FarmList({ stakedOnly, isActive }: any) {
  const { account } = useWeb3React()
  const { chosenFarmsMemoized } = useContext(FarmsContext)
  const hulkPrice = usePriceHULKBusd()
  // console.log(chosenFarmsMemoized)
  let resFarms: any[] = []
  if (!stakedOnly && isActive) {
    for (let i = 0; i < chosenFarmsMemoized.length; i++) {
      resFarms.push(chosenFarmsMemoized[i])
    }
    for (let i = 0; i < farms.length; i++) {
      if (chosenFarmsMemoized.findIndex((item) => item.pid === farms[i].pid) === -1) {
        resFarms.push(farms[i])
      }
    }
  } else {
    resFarms = [...chosenFarmsMemoized]
  }

  return (
    <FlexLayout>
      {resFarms.map((farm) => {
        return (
          <FarmCard
            key={farm.pid}
            farm={farm}
            displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
            hulkPrice={hulkPrice}
            account={account}
            removed={false}
          />
        )
      })}
    </FlexLayout>
  )
}

export default FarmList
