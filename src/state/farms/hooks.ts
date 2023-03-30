import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ChainId } from '@hulkfinance/hulk-swap-sdk'
import { farmsConfig } from '../../config/constants'
import { useFastRefreshEffect, useSlowRefreshEffect } from '../../hooks/useRefreshEffect'
import { useAppDispatch } from '../index'
import { fetchFarmsPublicDataAsync, fetchFarmUserDataAsync, nonArchivedFarms } from '.'
import { DeserializedFarm, DeserializedFarmsState, DeserializedFarmUserData, SerializedFarm, State } from '../types'
import {
  farmSelector,
  farmFromLpSymbolSelector,
  priceHulkFromPidSelector,
  makeBusdPriceFromPidSelector,
  makeUserFarmFromPidSelector,
  makeLpTokenPriceFromLpSymbolSelector,
  makeFarmFromPidSelector,
} from './selectors'
import { defaultChainId } from '../../config'
import { BIG_ZERO } from '../../utils/bigNumber'
import { QuoteToken } from '../../config/constants/types'

export const usePollFarmsWithUserData = (includeArchive = false) => {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()

  useSlowRefreshEffect(() => {
    const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
    const pids = farmsToFetch.map((farmToFetch: any) => farmToFetch.pid)

    // @ts-ignore
    dispatch(fetchFarmsPublicDataAsync(pids))

    if (account) {
      // @ts-ignore
      dispatch(fetchFarmUserDataAsync({ account, pids }))
    }
  }, [includeArchive, dispatch, account])
}

/**
 * Fetches the "core" farm data used globally
 * 2 = CAKE-BNB LP
 * 3 = BUSD-BNB LP
 */
const coreFarmPIDs: number[] = defaultChainId.toString() === String(ChainId.MAINNET) ? [0, 1, 5] : [0, 1, 5]
export const usePollCoreFarmData = () => {
  const dispatch = useAppDispatch()

  useFastRefreshEffect(() => {
    // @ts-ignore
    dispatch(fetchFarmsPublicDataAsync(coreFarmPIDs))
  }, [dispatch])
}

export const useFarms = (): DeserializedFarmsState => {
  return useSelector(farmSelector)
}

export const useFarmsPoolLength = (): number => {
  return useSelector((state: State) => state.farms.poolLength || 0)
}

export const useFarmFromPid = (pid: number): DeserializedFarm | null => {
  const farmFromPid = useMemo(() => makeFarmFromPidSelector(pid), [pid])
  return useSelector(farmFromPid)
}

export const useFarmFromLpSymbol = (lpSymbol: string): DeserializedFarm | null => {
  const farmFromLpSymbol = useMemo(() => farmFromLpSymbolSelector(lpSymbol), [lpSymbol])
  return useSelector(farmFromLpSymbol)
}

export const useFarmUser = (pid: number): DeserializedFarmUserData | undefined => {
  const farmFromPidUser = useMemo(() => makeUserFarmFromPidSelector(pid), [pid])
  return useSelector(farmFromPidUser)
}

// Return the base token price for a farm, from a given pid
export const useBusdPriceFromPid = (pid: number): BigNumber => {
  const busdPriceFromPid = useMemo(() => makeBusdPriceFromPidSelector(pid), [pid])
  return useSelector(busdPriceFromPid) || BIG_ZERO
}

export const useLpTokenPrice = (symbol: string) => {
  const lpTokenPriceFromLpSymbol = useMemo(() => makeLpTokenPriceFromLpSymbolSelector(symbol), [symbol])
  return useSelector(lpTokenPriceFromLpSymbol)
}

/**
 * @@deprecated use the BUSD hook in /hooks
 */
export const usePriceHULKBusd = (): BigNumber => {
  return useSelector(priceHulkFromPidSelector) || BIG_ZERO
}

export const usePriceBnbBusd = (): BigNumber => {
  const pid = 4 // BUSD-BNB LP
  const farm = useFarmFromPid(pid)
  if (farm) {
    return farm.quoteTokenPriceBusd ? new BigNumber(farm.quoteTokenPriceBusd) : BIG_ZERO
  }
  return BIG_ZERO
}

export const usePriceHulkBnb = (): BigNumber => {
  const pid = 1 // HULK-BNB LP
  const farm = useFarmFromPid(pid)
  if (farm) {
    return farm.tokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : BIG_ZERO
  }
  return BIG_ZERO
}

export const useTotalValue = (): BigNumber => {
  usePollFarmsWithUserData(false)
  const farms = useFarms()
  const bnbPrice = usePriceBnbBusd()
  const hulkPrice = usePriceHULKBusd()
  let value = new BigNumber(0)
  for (let i = 0; i < farms.data.length; i++) {
    const farm = farms.data[i]
    if (farm.lpTotalInQuoteToken) {
      let val
      if (farm.quoteToken.symbol === QuoteToken.BNB || farm.quoteToken.symbol === QuoteToken.WBNB) {
        val = bnbPrice.times(farm.lpTotalInQuoteToken)
      } else if (farm.quoteToken.symbol === QuoteToken.CAKE) {
        val = hulkPrice.times(farm.lpTotalInQuoteToken)
      } else {
        val = farm.lpTotalInQuoteToken
      }
      value = value.plus(val)
    }
  }
  return value
}
