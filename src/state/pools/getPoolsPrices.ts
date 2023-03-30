import BigNumber from 'bignumber.js'
import { BIG_ONE, BIG_ZERO } from '../../utils/bigNumber'
import { filterFarmsByQuoteToken } from '../../utils/farmsPriceHelpers'
import { SerializedFarm, SerializedPool } from '../types'
import tokens from '../../config/constants/tokens'
import { makeFarmFromPidSelector } from '../farms/selectors'

const getPoolFromTokenSymbol = (
  pools: SerializedPool[],
  tokenSymbol: string,
  preferredQuoteTokens?: string[],
): SerializedPool => {
  const poolsWithTokenSymbol = pools.filter((pool) => pool.token.symbol === tokenSymbol)
  const filteredPool = filterFarmsByQuoteToken(poolsWithTokenSymbol, preferredQuoteTokens)
  return filteredPool
}

const getPoolBaseTokenPrice = (
  pool: SerializedPool,
  quoteTokenPool: SerializedPool,
  bnbPriceBusd: BigNumber,
): BigNumber => {
  const hasTokenPriceVsQuote = Boolean(pool.tokenPriceVsQuote)

  if (pool.quoteToken.symbol === tokens.busd.symbol) {
    return hasTokenPriceVsQuote ? new BigNumber(pool.tokenPriceVsQuote || '') : BIG_ZERO
  }

  if (pool.quoteToken.symbol === tokens.wbnb.symbol) {
    return hasTokenPriceVsQuote ? bnbPriceBusd.times(pool.tokenPriceVsQuote || '') : BIG_ZERO
  }

  // We can only calculate profits without a quoteTokenPool for BUSD/BNB pools
  if (!quoteTokenPool) {
    return BIG_ZERO
  }

  // Possible alternative pool quoteTokens:
  // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
  // If the pool's quote token isn't BUSD or WBNB, we then use the quote token, of the original pool's quote token
  // i.e. for pool PNT - pBTC we use the pBTC pool's quote token - BNB, (pBTC - BNB)
  // from the BNB - pBTC price, we can calculate the PNT - BUSD price
  if (quoteTokenPool.quoteToken.symbol === tokens.wbnb.symbol) {
    const quoteTokenInBusd = bnbPriceBusd.times(quoteTokenPool.tokenPriceVsQuote || '')
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(pool.tokenPriceVsQuote || '').times(quoteTokenInBusd)
      : BIG_ZERO
  }

  if (quoteTokenPool.quoteToken.symbol === tokens.busd.symbol) {
    const quoteTokenInBusd = quoteTokenPool.tokenPriceVsQuote
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(pool.tokenPriceVsQuote || '').times(quoteTokenInBusd)
      : BIG_ZERO
  }

  // Catch in case token does not have immediate or once-removed BUSD/WBNB quoteToken
  return BIG_ONE
}

const getPoolQuoteTokenPrice = (
  pool: SerializedPool,
  quoteTokenPool: SerializedPool,
  bnbPriceBusd: BigNumber,
): BigNumber => {
  if (pool.quoteToken.symbol === 'BUSD') {
    return BIG_ONE
  }

  if (pool.quoteToken.symbol === 'WBNB') {
    return bnbPriceBusd
  }

  if (!quoteTokenPool) {
    return BIG_ZERO
  }

  if (quoteTokenPool.quoteToken.symbol === 'WBNB') {
    return quoteTokenPool.tokenPriceVsQuote ? bnbPriceBusd.times(quoteTokenPool.tokenPriceVsQuote) : BIG_ZERO
  }

  if (quoteTokenPool.quoteToken.symbol === 'BUSD') {
    return quoteTokenPool.tokenPriceVsQuote ? new BigNumber(quoteTokenPool.tokenPriceVsQuote) : BIG_ZERO
  }

  return BIG_ONE
}

const getPoolsPrices = (pools: SerializedPool[], farms: SerializedFarm[]) => {
  const bnbBusdPool = farms.find((farm) => farm.token.symbol === 'BUSD' && farm.quoteToken.symbol === 'WBNB')
  if (bnbBusdPool) {
    const bnbPriceBusd = bnbBusdPool.tokenPriceVsQuote ? BIG_ONE.div(bnbBusdPool.tokenPriceVsQuote) : BIG_ZERO
    const poolsWithPrices = pools.map((pool) => {
      const quoteTokenPool = getPoolFromTokenSymbol(pools, pool.quoteToken.symbol || '')
      const tokenPriceBusd = getPoolBaseTokenPrice(pool, quoteTokenPool, bnbPriceBusd)
      const quoteTokenPriceBusd = getPoolQuoteTokenPrice(pool, quoteTokenPool, bnbPriceBusd)

      return {
        ...pool,
        tokenPriceBusd: tokenPriceBusd.toJSON(),
        quoteTokenPriceBusd: quoteTokenPriceBusd.toJSON(),
      }
    })
    return poolsWithPrices
  }
  return []
}

export default getPoolsPrices
