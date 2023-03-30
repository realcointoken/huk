import chunk from 'lodash/chunk'
import erc20 from '../../config/abi/erc20.json'
import { getAddress, getMasterChefAddress } from '../../utils/addressHelpers'
import { multicallv2 } from '../../utils/multicall'
import { SerializedPool } from '../types'
import { SerializedPoolConfig } from '../../config/constants/types'

const fetchPoolCalls = (pool: SerializedPool) => {
  const { lpAddresses, token, quoteToken } = pool
  const lpAddress = getAddress(lpAddresses)
  return [
    // Balance of token in the LP contract
    {
      address: token.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of quote token on LP contract
    {
      address: quoteToken.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of LP tokens in the master chef contract
    {
      address: lpAddress,
      name: 'balanceOf',
      params: [getMasterChefAddress()],
    },
    // Total supply of LP tokens
    {
      address: lpAddress,
      name: 'totalSupply',
    },
    // Token decimals
    {
      address: token.address,
      name: 'decimals',
    },
    // Quote token decimals
    {
      address: quoteToken.address,
      name: 'decimals',
    },
  ]
}

export const fetchPublicPoolsData = async (pools: SerializedPoolConfig[]): Promise<any[]> => {
  const poolCalls = pools.flatMap((pool) => fetchPoolCalls(pool))
  const chunkSize = poolCalls.length / pools.length
  const poolMultiCallResult = await multicallv2(erc20, poolCalls)
  return chunk(poolMultiCallResult, chunkSize)
}
