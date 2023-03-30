import chunk from 'lodash/chunk'
import masterchefABI from '../../config/abi/masterchef.json'
import { multicallv2 } from '../../utils/multicall'
import { getBalanceAmount } from '../../utils/formatBalance'
import { ethersToBigNumber } from '../../utils/bigNumber'
import { SerializedPoolConfig } from '../../config/constants/types'
import { SerializedPool } from '../types'
import { getMasterChefAddress } from '../../utils/addressHelpers'
import { getMasterchefContract } from '../../utils/contractHelpers'

const masterChefAddress = getMasterChefAddress()
const masterChefContract = getMasterchefContract()

export const fetchMasterChefPoolPoolLength = async () => {
  const poolLength = await masterChefContract.poolLength()
  return poolLength
}

export const fetchMasterChefRegularHulkPerBlock = async () => {
  const regularHulkPerBlock = await masterChefContract.hulkPerBlock()
  return getBalanceAmount(ethersToBigNumber(regularHulkPerBlock))
}

const masterChefPoolCalls = (pool: SerializedPool) => {
  const { pid } = pool
  return pid || pid === 0
    ? [
        {
          address: masterChefAddress,
          name: 'poolInfo',
          params: [pid],
        },
        {
          address: masterChefAddress,
          name: 'totalAllocPoint',
        },
      ]
    : [null, null]
}

export const fetchMasterChefData = async (pools: SerializedPoolConfig[]): Promise<any[]> => {
  const masterChefCalls = pools.map((pool) => masterChefPoolCalls(pool))
  const chunkSize = masterChefCalls.flat().length / pools.length
  const masterChefAggregatedCalls: any = masterChefCalls
    .filter((masterChefCall) => masterChefCall[0] !== null && masterChefCall[1] !== null)
    .flat()
  const masterChefMultiCallResult = await multicallv2(masterchefABI, masterChefAggregatedCalls)
  const masterChefChunkedResultRaw = chunk(masterChefMultiCallResult, chunkSize)
  let masterChefChunkedResultCounter = 0
  return masterChefCalls.map((masterChefCall) => {
    if (masterChefCall[0] === null && masterChefCall[1] === null) {
      return [null, null]
    }
    const data = masterChefChunkedResultRaw[masterChefChunkedResultCounter]
    masterChefChunkedResultCounter++
    return data
  })
}
