import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useActiveWeb3React from './useActiveWeb3React'
import useBlockNumber from './useBlockNumber'
import { getBep20Contract, getHULKTokenContract } from '../utils/contractHelpers'
import { getProviderOrSigner } from '../utils'

export const getTokenBalance = async (library: any, tokenAddress: string, userAddress: string): Promise<string> => {
  const contract = getBep20Contract(tokenAddress, getProviderOrSigner(library, userAddress))
  try {
    if (contract) {
      const balance: string = await contract.balanceOf(userAddress)
      return balance
    }
    return '0'
  } catch (e) {
    return '0'
  }
}

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account, library } = useActiveWeb3React()
  const blockNumber = useBlockNumber()

  useEffect(() => {
    if (account && library) {
      const fetchBalance = async () => {
        const res = await getTokenBalance(library, tokenAddress, account)
        setBalance(new BigNumber(res))
      }
      fetchBalance()
    }
  }, [account, tokenAddress, library, blockNumber])

  return balance
}

export const useTotalSupply = () => {
  const blockNumber = useBlockNumber()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const { account, library } = useActiveWeb3React()

  const fetchTotalSupply = useCallback(async () => {
    // console.log('fetchTotalSupply')
    if (account && library) {
      const hulkContract = getHULKTokenContract(getProviderOrSigner(library, account))
      const supply = await hulkContract.totalSupply()
      setTotalSupply(new BigNumber(supply.toString()))
    }
  }, [account, library])

  useEffect(() => {
    fetchTotalSupply()
  }, [blockNumber, fetchTotalSupply])

  return totalSupply
}

export const useMaxTxAmount = () => {
  const [maxTxAmount, setMaxTxAmount] = useState<BigNumber>()
  const { account, library } = useActiveWeb3React()

  const fetchMaxTxAmount = useCallback(async () => {
    // console.log('fetchMaxTxAmount')
    if (account && library) {
      const hulkContract = getHULKTokenContract(getProviderOrSigner(library, account))
      const max = await hulkContract._maxTxAmount()
      setMaxTxAmount(new BigNumber(max.toString()))
    }
  }, [account, library])

  useEffect(() => {
    fetchMaxTxAmount()
  }, [fetchMaxTxAmount])

  return maxTxAmount
}

export const useBurnedBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const blockNumber = useBlockNumber()
  const { account, library } = useActiveWeb3React()

  const fetchBalance = useCallback(async () => {
    // console.log('useBurnedBalance')
    if (account && library) {
      const hulkContract = getHULKTokenContract(getProviderOrSigner(library, account))
      const bal = await hulkContract.balanceOf('0x000000000000000000000000000000000000dEaD')
      setBalance(new BigNumber(bal.toString()))
    }
  }, [account, library])
  useEffect(() => {
    fetchBalance()
  }, [tokenAddress, blockNumber, fetchBalance])

  return balance
}

export default useTokenBalance
