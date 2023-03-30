import { useCallback } from 'react'
import { stakeFarm } from '../../utils/calls'
import { useMasterchef } from '../useContract'
import useReferral from '../useReferral'

const useStakeFarms = (pid: number) => {
  const masterChefContract = useMasterchef()
  const {affiliateAddress} = useReferral()

  const handleStake = useCallback(
    async (amount: string) => {
      return stakeFarm(masterChefContract, pid, amount, affiliateAddress)
    },
    [affiliateAddress, masterChefContract, pid],
  )

  return { onStake: handleStake }
}

export default useStakeFarms
