import { ChainId } from '@hulkfinance/hulk-swap-sdk'
import addresses from '../config/constants/contracts'
import { Address } from '../config/constants/types'
import { defaultChainId } from '../config'

export const getAddress = (address: Address): string => {
  const chainId = defaultChainId
  return address[chainId] ? address[chainId] : address[ChainId.MAINNET]
}

export const getMasterChefAddress = () => {
  return getAddress(addresses.masterChef)
}
export const getMasterChefV1Address = () => {
  return getAddress(addresses.masterChefV1)
}
export const getMulticallAddress = () => {
  return getAddress(addresses.multiCall)
}
export const getMulticallV2Address = () => {
  return getAddress(addresses.multiCallV2)
}
export const getHULKSwapAddress = () => {
  return getAddress(addresses.hulkswap)
}
export const getHULKTokenAddress = () => {
  return getAddress(addresses.hulk)
}
export const getHULKPreAddress = () => {
  return getAddress(addresses.hulkpre)
}
export const getHULKReferralAddress = () => {
  return getAddress(addresses.HULKReferral)
}
