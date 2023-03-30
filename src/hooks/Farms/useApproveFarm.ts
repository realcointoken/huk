import { useCallback } from 'react'
import { MaxUint256 } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { useMasterchef } from '../useContract'
import useCallWithGasPrice from '../useCallWithGasPrice'

const useApproveFarm = (lpContract: Contract | null) => {
  const masterChefContract = useMasterchef()
  const { callWithGasPrice } = useCallWithGasPrice()
  const handleApprove = useCallback(async () => {
    if (lpContract) {
      return callWithGasPrice(lpContract, 'approve', [masterChefContract.address, MaxUint256])
    }
    return null
  }, [lpContract, masterChefContract, callWithGasPrice])

  return { onApprove: handleApprove }
}

export default useApproveFarm
