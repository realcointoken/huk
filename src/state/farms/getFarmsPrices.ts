import BigNumber from 'bignumber.js'
import { BIG_ONE, BIG_ZERO } from '../../utils/bigNumber'
import { filterFarmsByQuoteToken } from '../../utils/farmsPriceHelpers'
import { SerializedFarm } from '../types'
import tokens from '../../config/constants/tokens'

const getFarmFromTokenSymbol = (
  farms: SerializedFarm[],
  tokenSymbol: string,
  preferredQuoteTokens?: string[],
): SerializedFarm => {
  const farmsWithTokenSymbol = farms.filter((farm) => farm.token.symbol === tokenSymbol)
  const filteredFarm = filterFarmsByQuoteToken(farmsWithTokenSymbol, preferredQuoteTokens)
  return filteredFarm
}

const getFarmBaseTokenPrice = (
  farm: SerializedFarm,
  quoteTokenFarm: SerializedFarm,
  bnbPriceBusd: BigNumber,
): BigNumber => {
  const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote)

  if (farm.quoteToken.symbol === tokens.busd.symbol) {
    return hasTokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote || '') : BIG_ZERO
  }

  if (farm.quoteToken.symbol === tokens.wbnb.symbol) {
    return hasTokenPriceVsQuote ? bnbPriceBusd.times(farm.tokenPriceVsQuote || '') : BIG_ZERO
  }

  // We can only calculate profits without a quoteTokenFarm for BUSD/BNB farms
  if (!quoteTokenFarm) {
    return BIG_ZERO
  }

  // Possible alternative farm quoteTokens:
  // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
  // If the farm's quote token isn't BUSD or WBNB, we then use the quote token, of the original farm's quote token
  // i.e. for farm PNT - pBTC we use the pBTC farm's quote token - BNB, (pBTC - BNB)
  // from the BNB - pBTC price, we can calculate the PNT - BUSD price
  if (quoteTokenFarm.quoteToken.symbol === tokens.wbnb.symbol) {
    const quoteTokenInBusd = bnbPriceBusd.times(quoteTokenFarm.tokenPriceVsQuote || '')
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(farm.tokenPriceVsQuote || '').times(quoteTokenInBusd)
      : BIG_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === tokens.busd.symbol) {
    const quoteTokenInBusd = quoteTokenFarm.tokenPriceVsQuote
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(farm.tokenPriceVsQuote || '').times(quoteTokenInBusd)
      : BIG_ZERO
  }

  // Catch in case token does not have immediate or once-removed BUSD/WBNB quoteToken
  return BIG_ZERO
}

const getFarmQuoteTokenPrice = (
  farm: SerializedFarm,
  quoteTokenFarm: SerializedFarm,
  bnbPriceBusd: BigNumber,
  cakePriceBusd: BigNumber,
): BigNumber => {
  if (farm.quoteToken.symbol === 'BUSD') {
    return BIG_ONE
  }

  if (farm.quoteToken.symbol === 'WBNB') {
    return bnbPriceBusd
  }

  if (farm.quoteToken.symbol === 'CAKE') {
    return farm.tokenPriceVsQuote ? cakePriceBusd.times(farm.tokenPriceVsQuote) : BIG_ZERO
  }

  if (!quoteTokenFarm) {
    return BIG_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === 'WBNB') {
    return quoteTokenFarm.tokenPriceVsQuote ? bnbPriceBusd.times(quoteTokenFarm.tokenPriceVsQuote) : BIG_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === 'BUSD') {
    return quoteTokenFarm.tokenPriceVsQuote ? new BigNumber(quoteTokenFarm.tokenPriceVsQuote) : BIG_ZERO
  }

  return BIG_ZERO
}

const getFarmsPrices = (farms: SerializedFarm[]) => {
  const bnbBusdFarm = farms.find((farm) => farm.token.symbol === 'BUSD' && farm.quoteToken.symbol === 'WBNB')
  const cakeFarm = farms.find((farm) => farm.quoteToken.symbol === 'CAKE')
  let cakePriceBusd: any
  if (bnbBusdFarm) {
    const bnbPriceBusd = bnbBusdFarm.tokenPriceVsQuote ? BIG_ONE.div(bnbBusdFarm.tokenPriceVsQuote) : BIG_ZERO
    if (cakeFarm) {
      cakePriceBusd = cakeFarm.tokenPriceVsQuote ? BIG_ONE.div(cakeFarm.tokenPriceVsQuote) : BIG_ZERO
    }
    const farmsWithPrices = farms.map((farm) => {
      const quoteTokenFarm = getFarmFromTokenSymbol(farms, farm.quoteToken.symbol || '')
      const tokenPriceBusd = getFarmBaseTokenPrice(farm, quoteTokenFarm, bnbPriceBusd)
      const quoteTokenPriceBusd = getFarmQuoteTokenPrice(farm, quoteTokenFarm, bnbPriceBusd, cakePriceBusd)
      // console.log(tokenPriceBusd.toString())
      return {
        ...farm,
        tokenPriceBusd: !tokenPriceBusd.isNaN() ? tokenPriceBusd.toJSON() : BIG_ONE.toJSON(),
        quoteTokenPriceBusd: !quoteTokenPriceBusd.isNaN() ? quoteTokenPriceBusd.toJSON() : BIG_ONE.toJSON(),
      }
    })
    return farmsWithPrices
  }
  return []
}
// tokenPriceBusd ? tokenPriceBusd.toJSON() : BIG_ONE,

export default getFarmsPrices
