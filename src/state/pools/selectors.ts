import BigNumber from 'bignumber.js'
import {createSelector} from '@reduxjs/toolkit'
import {BIG_ZERO} from '../../utils/bigNumber'
import {getBalanceAmount} from '../../utils/formatBalance'
import {State, SerializedPool, DeserializedPool, DeserializedPoolUserData} from '../types'
import {deserializeToken} from '../user/hooks/helpers'

const deserializePoolUserData = (pool: SerializedPool): DeserializedPoolUserData => {
    return {
        allowance: pool.userData ? new BigNumber(pool.userData.allowance) : BIG_ZERO,
        tokenBalance: pool.userData ? new BigNumber(pool.userData.tokenBalance) : BIG_ZERO,
        stakedBalance: pool.userData ? new BigNumber(pool.userData.stakedBalance) : BIG_ZERO,
        earnings: pool.userData ? new BigNumber(pool.userData.earnings) : BIG_ZERO,
        canHarvest: pool.userData ? pool.userData.canHarvest : false,
        nextHarvestUntil: pool.userData?.nextHarvestUntil
    }
}

const deserializePool = (pool: SerializedPool): DeserializedPool => {
    const {lpAddresses, lpSymbol, pid, dual, multiplier, isCommunity, quoteTokenPriceBusd, tokenPriceBusd, defaultApr, depositFeeBP, v1pid} = pool

    return {
        lpAddresses,
        defaultApr,
        depositFeeBP,
        lpSymbol,
        pid,
        dual,
        multiplier,
        v1pid,
        isCommunity,
        quoteTokenPriceBusd,
        tokenPriceBusd,
        token: deserializeToken(pool.token),
        quoteToken: deserializeToken(pool.quoteToken),
        userData: deserializePoolUserData(pool),
        tokenAmountTotal: pool.tokenAmountTotal ? new BigNumber(pool.tokenAmountTotal) : BIG_ZERO,
        quoteTokenAmountTotal: pool.quoteTokenAmountTotal ? new BigNumber(pool.quoteTokenAmountTotal) : BIG_ZERO,
        lpTotalInQuoteToken: pool.lpTotalInQuoteToken ? new BigNumber(pool.lpTotalInQuoteToken) : BIG_ZERO,
        lpTotalSupply: pool.lpTotalSupply ? new BigNumber(pool.lpTotalSupply) : BIG_ZERO,
        tokenPriceVsQuote: pool.tokenPriceVsQuote ? new BigNumber(pool.tokenPriceVsQuote) : BIG_ZERO,
        poolWeight: pool.poolWeight ? new BigNumber(pool.poolWeight) : BIG_ZERO,
    }
}

const selectHulkPool = (state: State) => state.pools.data.find((f) => f.pid === 3)
const selectPoolByKey = (key: string, value: string | number) => (state: State) =>
// @ts-ignore
    state.pools.data.find((f) => f[key] === value)

export const makePoolFromPidSelector = (pid: number) =>
    createSelector([selectPoolByKey('pid', pid)], (pool) => pool ? deserializePool(pool) : null)

export const makeBusdPriceFromPidSelector = (pid: number) =>
    createSelector([selectPoolByKey('pid', pid)], (pool) => {
        if (pool) {
            const deserializedPool = deserializePool(pool)
            return deserializedPool && new BigNumber(deserializedPool.tokenPriceBusd || '')
        }
    })

export const makeUserPoolFromPidSelector = (pid: number) =>
    createSelector([selectPoolByKey('pid', pid)], (pool) => {
        if (pool) {
            const {userData} = deserializePool(pool)
            if (userData) {
                const {allowance, tokenBalance, stakedBalance, earnings, canHarvest, nextHarvestUntil} = userData
                return {
                    allowance,
                    tokenBalance,
                    stakedBalance,
                    earnings,
                    canHarvest,
                    nextHarvestUntil
                }
            }
        }
    })

export const priceHulkFromPidSelector = createSelector([selectHulkPool], (hulkBnbPool) => {
    if (hulkBnbPool) {
        const deserializedHulkBnbPool = deserializePool(hulkBnbPool)
        const umPriceBusdAsString = deserializedHulkBnbPool.tokenPriceBusd
        return new BigNumber(umPriceBusdAsString || '')
    }
})

export const poolFromLpSymbolSelector = (lpSymbol: string) =>
    createSelector([selectPoolByKey('lpSymbol', lpSymbol)], (pool) => pool ? deserializePool(pool) : null)

export const makeLpTokenPriceFromLpSymbolSelector = (lpSymbol: string) =>
    createSelector([selectPoolByKey('lpSymbol', lpSymbol)], (pool) => {
        let lpTokenPrice = BIG_ZERO
        if (pool) {
            const deserializedPool = deserializePool(pool)
            if (deserializedPool) {
                const poolTokenPriceInUsd = deserializedPool && new BigNumber(deserializedPool.tokenPriceBusd || '')

                if (deserializedPool?.lpTotalSupply?.gt(0) && deserializedPool.lpTotalInQuoteToken?.gt(0)) {
                    // Total value of base token in LP
                    const valueOfBaseTokenInPool = poolTokenPriceInUsd.times(deserializedPool.tokenAmountTotal || '')
                    // Double it to get overall value in LP
                    const overallValueOfAllTokensInPool = valueOfBaseTokenInPool.times(2)
                    // Divide total value of all tokens, by the number of LP tokens
                    const totalLpTokens = getBalanceAmount(deserializedPool.lpTotalSupply)
                    lpTokenPrice = overallValueOfAllTokensInPool.div(totalLpTokens)
                }
            }
        }
        return lpTokenPrice
    })

export const poolSelector = createSelector(
    (state: State) => state.pools,
    (pools) => {
        const deserializedPoolsData = pools.data.map(deserializePool)
        const {loadArchivedPoolsData, userDataLoaded, poolLength, regularHulkPerBlock} = pools
        return {
            loadArchivedPoolsData,
            userDataLoaded,
            data: deserializedPoolsData,
            poolLength,
            regularHulkPerBlock,
        }
    },
)
