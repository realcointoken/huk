import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ChainId } from '@hulkfinance/hulk-swap-sdk'
import { poolsConfig } from '../../config/constants'
import { useFastRefreshEffect, useSlowRefreshEffect } from '../../hooks/useRefreshEffect'
import { useAppDispatch } from '../index'
import { fetchPoolsPublicDataAsync, fetchPoolUserDataAsync, nonArchivedPools } from '.'
import { DeserializedPool, DeserializedPoolsState, DeserializedPoolUserData, State } from '../types'
import {
  poolSelector,
  poolFromLpSymbolSelector,
  priceHulkFromPidSelector,
  makeBusdPriceFromPidSelector,
  makeUserPoolFromPidSelector,
  makeLpTokenPriceFromLpSymbolSelector,
  makePoolFromPidSelector,
} from './selectors'
import { defaultChainId } from '../../config'
import { BIG_ZERO } from '../../utils/bigNumber'
import { QuoteToken } from '../../config/constants/types'

export const usePollPoolsWithUserData = (includeArchive = false) => {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()

  useSlowRefreshEffect(() => {
    const poolsToFetch = includeArchive ? poolsConfig : nonArchivedPools
    const pids = poolsToFetch.map((poolToFetch: any) => poolToFetch.pid)

    // @ts-ignore
    dispatch(fetchPoolsPublicDataAsync(pids))

    if (account) {
      // @ts-ignore
      dispatch(fetchPoolUserDataAsync({ account, pids }))
    }
  }, [includeArchive, dispatch, account])
}

/**
 * Fetches the "core" pool data used globally
 * 2 = CAKE-BNB LP
 * 3 = BUSD-BNB LP
 */
const corePoolPIDs: number[] = defaultChainId.toString() === String(ChainId.MAINNET) ? [0, 1, 2] : [0, 1, 2]
export const usePollCorePoolData = () => {
  const dispatch = useAppDispatch()

  useFastRefreshEffect(() => {
    // @ts-ignore
    dispatch(fetchPoolsPublicDataAsync(corePoolPIDs))
  }, [dispatch])
}

export const usePools = (): DeserializedPoolsState => {
  return useSelector(poolSelector)
}

export const usePoolsPoolLength = (): number => {
  return useSelector((state: State) => state.pools.poolLength || 0)
}

export const usePoolFromPid = (pid: number): DeserializedPool | null => {
  const poolFromPid = useMemo(() => makePoolFromPidSelector(pid), [pid])
  return useSelector(poolFromPid)
}

export const usePoolFromLpSymbol = (lpSymbol: string): DeserializedPool | null => {
  const poolFromLpSymbol = useMemo(() => poolFromLpSymbolSelector(lpSymbol), [lpSymbol])
  return useSelector(poolFromLpSymbol)
}

export const usePoolUser = (pid: number): DeserializedPoolUserData | undefined => {
  const poolFromPidUser = useMemo(() => makeUserPoolFromPidSelector(pid), [pid])
  return useSelector(poolFromPidUser)
}

// Return the base token price for a pool, from a given pid
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
  const pid = 2 // BUSD-BNB LP
  const pool = usePoolFromPid(pid)
  if (pool) {
    return pool.tokenPriceVsQuote ? new BigNumber(pool.tokenPriceVsQuote) : BIG_ZERO
  }
  return BIG_ZERO
}
export const useTotalValue = (): BigNumber => {
  usePollPoolsWithUserData(false)
  const pools = usePools()
  const bnbPrice = usePriceBnbBusd()
  const hulkPrice = usePriceHULKBusd()
  let value = new BigNumber(0)
  for (let i = 0; i < pools.data.length; i++) {
    const pool = pools.data[i]
    if (pool.lpTotalInQuoteToken) {
      let val
      if (pool.quoteToken.symbol === QuoteToken.BNB) {
        val = bnbPrice.times(pool.lpTotalInQuoteToken)
      } else if (pool.quoteToken.symbol === QuoteToken.CAKE) {
        val = hulkPrice.times(pool.lpTotalInQuoteToken)
      } else {
        val = pool.lpTotalInQuoteToken
      }
      value = value.plus(val)
    }
  }
  return value
}
