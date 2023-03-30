import BigNumber from 'bignumber.js'
import { fromWei } from 'web3-utils'
import { SerializedPoolConfig } from '../../config/constants/types'
import { BIG_TEN, BIG_ZERO } from '../../utils/bigNumber'
import { fetchPublicPoolsData } from './fetchPublicPoolsData'
import { fetchMasterChefData } from './fetchMasterChefData'
import { SerializedPool } from '../types'

const fetchPools = async (poolsToFetch: SerializedPoolConfig[]): Promise<SerializedPool[]> => {
  const poolResult = await fetchPublicPoolsData(poolsToFetch)
  const masterChefResult = await fetchMasterChefData(poolsToFetch)

  return poolsToFetch.map((pool, index) => {
    const [
      tokenBalanceLP,
      quoteTokenBalanceLP,
      lpTokenBalanceMC,
      lpTotalSupply,
      tokenDecimals,
      quoteTokenDecimals,
    ] = poolResult[index]

    const [info, totalRegularAllocPoint] = masterChefResult[index]

    // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
    const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))

    // Raw amount of token in the LP, including those not staked
    const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
    const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))

    // Amount of quoteToken in the LP that are staked in the MC
    // const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)
    const quoteTokenAmountMc = info ? new BigNumber(fromWei(info.totalLp.toString())) : BIG_ZERO

    // Total staked in LP, in quote token value
    const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(1))

    const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO
    // console.log(allocPoint.toString())
    const poolWeight = totalRegularAllocPoint ? allocPoint.div(new BigNumber(totalRegularAllocPoint)) : BIG_ZERO

    return {
      ...pool,
      token: pool.token,
      quoteToken: pool.quoteToken,
      tokenAmountTotal: tokenAmountTotal.toJSON(),
      quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
      lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
      lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
      tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
      poolWeight: poolWeight.toJSON(),
      multiplier: `${allocPoint.div(100).toString()}X`,
    }
  })
}

export default fetchPools
