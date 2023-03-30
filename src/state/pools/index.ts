import type {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
  // eslint-disable-next-line import/no-unresolved
} from '@reduxjs/toolkit/dist/matchers'
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import stringify from 'fast-json-stable-stringify'
import poolsConfig from '../../config/constants/pools'
import { isArchivedPid } from '../../utils/farmHelpers'
import type { AppState } from '../index'
import fetchPools from './fetchPools'
import getPoolsPrices from './getPoolsPrices'
import {
  fetchPoolUserEarnings,
  fetchPoolUserAllowances,
  fetchPoolUserTokenBalances,
  fetchPoolUserStakedBalances,
  fetchPoolUserCanHarvest,
} from './fetchPoolsUser'
import { SerializedPoolsState, SerializedPool } from '../types'
import { fetchMasterChefPoolPoolLength, fetchMasterChefRegularHulkPerBlock } from './fetchMasterChefData'
import { resetUserState } from '../global/actions'

const noAccountPoolConfig = poolsConfig.map((pool: any) => ({
  ...pool,
  userData: {
    allowance: '0',
    tokenBalance: '0',
    stakedBalance: '0',
    earnings: '0',
    canHarvest: false,
    nextHarvestUntil: undefined,
  },
}))

const initialState: SerializedPoolsState = {
  data: noAccountPoolConfig,
  loadArchivedPoolsData: false,
  userDataLoaded: false,
  loadingKeys: {},
}

export const nonArchivedPools = poolsConfig.filter(({ pid }: any) => !isArchivedPid(pid))

// Async thunks
export const fetchPoolsPublicDataAsync = createAsyncThunk<
  [SerializedPool[], number, number],
  number[],
  { state: AppState }
>(
  'pools/fetchPoolsPublicDataAsync',
  async (pids, ThunkAPI) => {
    const allPids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const poolLength = await fetchMasterChefPoolPoolLength()
    const { farms } = ThunkAPI.getState()
    const regularHulkPerBlock = await fetchMasterChefRegularHulkPerBlock()
    const poolsToFetch = poolsConfig.filter((poolConfig: any) => allPids.includes(poolConfig.pid))
    const poolsCanFetch = poolsToFetch.filter((f: any) => poolLength.gt(f.pid))

    // Add price helper pools
    const poolsWithPriceHelpers = poolsToFetch.concat([])

    const pools = await fetchPools(poolsWithPriceHelpers)

    const poolsWithPrices = getPoolsPrices(pools, farms.data)
    // Filter out price helper LP config pools
    const poolsWithoutHelperLps = poolsWithPrices.filter((pool: SerializedPool) => {
      return pool.pid || pool.pid === 0
    })
    return [poolsWithoutHelperLps, poolLength.toNumber(), regularHulkPerBlock.toNumber()]
  },
  {
    condition: (arg, { getState }) => {
      const { pools } = getState()
      if (pools.loadingKeys[stringify({ type: fetchPoolsPublicDataAsync.typePrefix, arg })]) {
        // console.debug('pools action is fetching, skipping here')
        return false
      }
      return true
    },
  },
)

interface PoolUserDataResponse {
  pid: number
  allowance: string
  tokenBalance: string
  stakedBalance: string
  earnings: string
  canHarvest: boolean
  nextHarvestUntil?: number
}

export const fetchPoolUserDataAsync = createAsyncThunk<
  PoolUserDataResponse[],
  { account: string; pids: number[] },
  {
    state: AppState
  }
>(
  'pools/fetchPoolUserDataAsync',
  async ({ account, pids }) => {
    const poolLength = await fetchMasterChefPoolPoolLength()
    const poolsToFetch = poolsConfig.filter((poolConfig) => pids.includes(poolConfig.pid))
    const poolsCanFetch = poolsToFetch.filter((f) => poolLength.gt(f.pid))
    const userPoolAllowances = await fetchPoolUserAllowances(account, poolsCanFetch)
    const userPoolTokenBalances = await fetchPoolUserTokenBalances(account, poolsCanFetch)
    const userStakedBalances = await fetchPoolUserStakedBalances(account, poolsCanFetch)
    const userPoolEarnings = await fetchPoolUserEarnings(account, poolsCanFetch)
    const userPoolCanHarvest = await fetchPoolUserCanHarvest(account, poolsCanFetch)

    return userPoolAllowances.map((poolAllowance, index) => {
      return {
        pid: poolsCanFetch[index].pid,
        allowance: userPoolAllowances[index],
        tokenBalance: userPoolTokenBalances[index],
        stakedBalance: userStakedBalances[index].stakedBalance,
        nextHarvestUntil: userStakedBalances[index].nextHarvestUntil * 1000,
        earnings: userPoolEarnings[index],
        canHarvest: userPoolCanHarvest[index],
      }
    })
  },
  {
    condition: (arg, { getState }) => {
      const { pools } = getState()
      if (pools.loadingKeys[stringify({ type: fetchPoolUserDataAsync.typePrefix, arg })]) {
        // console.debug('pools user action is fetching, skipping here')
        return false
      }
      return true
    },
  },
)

type UnknownAsyncThunkFulfilledOrPendingAction =
  | UnknownAsyncThunkFulfilledAction
  | UnknownAsyncThunkPendingAction
  | UnknownAsyncThunkRejectedAction

const serializeLoadingKey = (
  action: UnknownAsyncThunkFulfilledOrPendingAction,
  suffix: UnknownAsyncThunkFulfilledOrPendingAction['meta']['requestStatus'],
) => {
  const type = action.type.split(`/${suffix}`)[0]
  return stringify({
    arg: action.meta.arg,
    type,
  })
}

export const poolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map((pool) => {
        return {
          ...pool,
          userData: {
            allowance: '0',
            tokenBalance: '0',
            stakedBalance: '0',
            earnings: '0',
            canHarvest: false,
            nextHarvestUntil: undefined,
          },
        }
      })
      state.userDataLoaded = false
    })
    // Update pools with live data
    builder.addCase(fetchPoolsPublicDataAsync.fulfilled, (state, action) => {
      const [poolPayload, poolLength, regularHulkPerBlock] = action.payload
      state.data = state.data.map((pool) => {
        const livePoolData = poolPayload.find((poolData) => poolData.pid === pool.pid)
        return { ...pool, ...livePoolData }
      })
      state.poolLength = poolLength
      state.regularHulkPerBlock = regularHulkPerBlock
    })

    // Update pools with user data
    builder.addCase(fetchPoolUserDataAsync.fulfilled, (state, action) => {
      action.payload.forEach((userDataEl) => {
        const { pid } = userDataEl
        const index = state.data.findIndex((pool) => pool.pid === pid)
        state.data[index] = { ...state.data[index], userData: userDataEl }
      })
      state.userDataLoaded = true
    })

    builder.addMatcher(isAnyOf(fetchPoolUserDataAsync.pending, fetchPoolsPublicDataAsync.pending), (state, action) => {
      state.loadingKeys[serializeLoadingKey(action, 'pending')] = true
    })
    builder.addMatcher(
      isAnyOf(fetchPoolUserDataAsync.fulfilled, fetchPoolsPublicDataAsync.fulfilled),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'fulfilled')] = false
      },
    )
    builder.addMatcher(
      isAnyOf(fetchPoolsPublicDataAsync.rejected, fetchPoolUserDataAsync.rejected),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'rejected')] = false
      },
    )
  },
})

export default poolsSlice.reducer
