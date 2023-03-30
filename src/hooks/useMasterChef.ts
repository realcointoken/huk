/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useActiveWeb3React from './useActiveWeb3React'
import useBlockNumber from './useBlockNumber'
import { getBep20Contract, getHULKTokenContract, getMasterchefContract } from '../utils/contractHelpers'
import { getProviderOrSigner } from '../utils'

export const useHulkPerBlock = () => {
  const masterChefContract = getMasterchefContract()
  const [hulkPerBlock, setHulkPerBlock] = useState<BigNumber>()
  const { account, library } = useActiveWeb3React()

  const fetchHulkPerBlock = useCallback(async () => {
    // console.log('fetchHulkPerBlock')
    if (account && library) {
      const regularHulkPerBlock = await masterChefContract.hulkPerBlock()
      setHulkPerBlock(new BigNumber(regularHulkPerBlock.toString()))
    }
  }, [account, library])

  useEffect(() => {
    fetchHulkPerBlock()
  }, [fetchHulkPerBlock])

  return hulkPerBlock
}

export const useRemainRewards = () => {
  const masterChefContract = getMasterchefContract()
  const [remainRewards, setRemainRewards] = useState<BigNumber>()
  const { account, library } = useActiveWeb3React()

  const fetchRemainRewards = useCallback(async () => {
    // console.log('remainRewards')
    if (account && library) {
      const remain = masterChefContract.remainRewards()
      setRemainRewards(new BigNumber(remain.toString()))
    }
  }, [account, library])

  useEffect(() => {
    fetchRemainRewards()
  }, [fetchRemainRewards])

  return remainRewards
}

export const usePoolLength = () => {
  const masterChefContract = getMasterchefContract()
  const [poolLength, setPoolLength] = useState<BigNumber>()
  const { account, library } = useActiveWeb3React()

  const fetchPoolLength = useCallback(async () => {
    if (account && library) {
      const length = await masterChefContract.poolLength()
      // console.log(length)
      setPoolLength(new BigNumber(length.toString()))
    }
  }, [account, library])

  useEffect(() => {
    fetchPoolLength()
  }, [fetchPoolLength])

  return poolLength
}
