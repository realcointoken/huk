import BigNumber from 'bignumber.js'
import erc20ABI from '../../config/abi/erc20.json'
import { getAddress, getMasterChefAddress } from '../../utils/addressHelpers'
import masterchefABI from "../../config/abi/masterchef.json"
import multicall from '../../utils/multicall'
import { SerializedPoolConfig } from '../../config/constants/types'

export const fetchPoolUserAllowances = async (account: string, poolsToFetch: SerializedPoolConfig[]) => {
  const masterChefAddress = getMasterChefAddress()

  const calls = poolsToFetch.map((pool) => {
    const lpContractAddress = getAddress(pool.lpAddresses)
    return { address: lpContractAddress, name: 'allowance', params: [account, masterChefAddress] }
  })

  const rawLpAllowances = await multicall<BigNumber[]>(erc20ABI, calls)
  const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
    return new BigNumber(lpBalance).toJSON()
  })
  return parsedLpAllowances
}

export const fetchPoolUserTokenBalances = async (account: string, poolsToFetch: SerializedPoolConfig[]) => {
  const calls = poolsToFetch.map((pool) => {
    const lpContractAddress = getAddress(pool.lpAddresses)
    return {
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account],
    }
  })

  const rawTokenBalances = await multicall(erc20ABI, calls)
  const parsedTokenBalances = rawTokenBalances.map((tokenBalance: any) => {
    return new BigNumber(tokenBalance).toJSON()
  })
  return parsedTokenBalances
}

export const fetchPoolUserStakedBalances = async (account: string, poolsToFetch: SerializedPoolConfig[]) => {
  const masterChefAddress = getMasterChefAddress()

  const calls = poolsToFetch.map((pool) => {
    return {
      address: masterChefAddress,
      name: 'userInfo',
      params: [pool.pid, account],
    }
  })

  const rawStakedBalances = await multicall(masterchefABI, calls)
  const parsedStakedBalances = rawStakedBalances.map((stakedBalance: any) => {
    return {
      stakedBalance: new BigNumber(stakedBalance[0]._hex).toJSON(),
      nextHarvestUntil: stakedBalance.nextHarvestUntil.toNumber()
    }
  })
  return parsedStakedBalances
}

export const fetchPoolUserEarnings = async (account: string, poolsToFetch: SerializedPoolConfig[]) => {
  const masterChefAddress = getMasterChefAddress()

  const calls = poolsToFetch.map((pool) => {
    return {
      address: masterChefAddress,
      name: 'pendingHULK',
      params: [pool.pid, account],
    }
  })

  const rawEarnings = await multicall(masterchefABI, calls)
  const parsedEarnings = rawEarnings.map((earnings: any) => {
    return new BigNumber(earnings).toJSON()
  })
  return parsedEarnings
}

export const fetchPoolUserCanHarvest = async (account: string, poolsToFetch: SerializedPoolConfig[]) => {
  const masterChefAddress = getMasterChefAddress()

  const calls = poolsToFetch.map((pool) => {
    return {
      address: masterChefAddress,
      name: 'canHarvest',
      params: [pool.pid, account],
    }
  })

  const rawCanHarvest = await multicall(masterchefABI, calls)
  const parsedCanHarvest = rawCanHarvest.map((val: any) => {
    return val[0]
  })
  return parsedCanHarvest
}