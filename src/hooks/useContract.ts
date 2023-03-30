import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
import ERC20_BYTES32_ABI from '../config/abi/erc20_bytes32.json'
import ERC20_ABI from '../config/abi/erc20.json'
import MULTICALL_ABI from '../config/abi/Multicall.json'
import {getContract, getProviderOrSigner} from '../utils'
import {
  getHULKSwapAddress,
  getHULKPreAddress, getHULKTokenAddress,
  getMulticallAddress,
} from '../utils/addressHelpers'
import useActiveWeb3React from "./useActiveWeb3React";
import { getBep20Contract, getLPContract, getMasterchefContract } from '../utils/contractHelpers'
import hulkpre from '../config/abi/hulkpre.json'
import hulkswap from '../config/abi/hulkswap.json'
import hulk from '../config/abi/hulk.json'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}


export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}


export const useERC20 = (address: string, withSignerIfPossible = true) => {
  const { library, account } = useActiveWeb3React()
  return useMemo(
      () => getBep20Contract(address, withSignerIfPossible && library ? getProviderOrSigner(library, account) : undefined),
      [account, address, library, withSignerIfPossible],
  )
}

export const useMasterchef = (withSignerIfPossible = true) => {
  const { library, account } = useActiveWeb3React()
  return useMemo(
      () => getMasterchefContract(withSignerIfPossible && library ? getProviderOrSigner(library, account) : undefined),
      [library, withSignerIfPossible, account],
  )
}

export function useMulticallContract(): Contract | null {
  return useContract(getMulticallAddress(), MULTICALL_ABI, false)
}

export const useHulkPreContract = () => {
  return useContract(getHULKPreAddress(), hulkpre)
}

export const useHulkSwapContract = () => {
  return useContract(getHULKSwapAddress(), hulkswap)
}

export const useHulkContract = () => {
  return useContract(getHULKTokenAddress(), hulk)
}

export const useLPContract = (address: string, withSignerIfPossible = true): Contract | null => {
  const {library, account} = useActiveWeb3React()
  return useMemo(
    () => {
      if (account) {
        return  getLPContract(address, withSignerIfPossible && library ? getProviderOrSigner(library, account) : undefined)
      }
        return null

    },
    [account, address, library, withSignerIfPossible],
  )
}