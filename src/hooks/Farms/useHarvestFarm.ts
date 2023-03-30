import { useCallback } from 'react'
import { Contract } from 'ethers'
import { harvestFarm } from '../../utils/calls'
import { useMasterchef } from '../useContract'
import useActiveWeb3React from '../useActiveWeb3React'
import useReferral from '../useReferral'

export const useHarvestFarm = (farmPid: number) => {
  const masterChefContract = useMasterchef()
  const { affiliateAddress } = useReferral()

  const handleHarvest = useCallback(async () => {
    return harvestFarm(masterChefContract, farmPid, affiliateAddress)
  }, [affiliateAddress, farmPid, masterChefContract])

  return { onReward: handleHarvest }
}

export const harvest = async (masterChefContract: Contract, pid: number, account: string) => {
  const tx: any = await masterChefContract.deposit(pid, '0', account)
  return tx.hash
}
export const useAllHarvest = (farmPids: number[]) => {
  const { account } = useActiveWeb3React()
  const masterChefContract = useMasterchef()

  const handleHarvest = useCallback(async () => {
    if (account && masterChefContract) {
      const harvestPromises = farmPids.reduce((accum: any[], pid) => {
        return [...accum, harvest(masterChefContract, pid, account)]
      }, [])

      return Promise.all(harvestPromises)
    }
    return []
  }, [account, farmPids, masterChefContract])

  return { onReward: handleHarvest }
}
