import BigNumber from 'bignumber.js'
import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from '../../config'
import getGasPrice from '../getGasPrice'
import { SerializedFarm } from '../../state/types'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

export const stakeFarm = async (masterChefContract: any, pid: any, amount: any, affiliateAddress: string) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()

  return masterChefContract.deposit(pid, value, affiliateAddress)
}

export const unstakeFarm = async (masterChefContract: any, pid: any, amount: any) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()

  return masterChefContract.withdraw(pid, value)
}

export const harvestFarm = async (masterChefContract: any, pid: any, affiliateAddress: string) => {
  return masterChefContract.deposit(pid, '0', affiliateAddress)
}
