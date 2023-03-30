import type { Signer } from '@ethersproject/abstract-signer'
import type { Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
// import poolsConfig from '../config/constants/pools'
// import { PoolCategory } from '../config/constants/types'
import tokens from '../config/constants/tokens'

// Addresses
import {
  // getAddress,
  // getAnniversaryAchievement,
  // getBunnyFactoryAddress, getBunnySpecialAddress,
  // getBunnySpecialHulkVaultAddress, getBunnySpecialLotteryAddress, getBunnySpecialPredictionAddress,
  // getBunnySpecialXmasAddress,
  // getHulkVaultAddress, getChainlinkOracleAddress, getClaimRefundAddress, getEasterNftAddress,
  // getFarmAuctionAddress,
  // getLotteryV2Address,
  getMasterChefAddress,
  getMasterChefV1Address,
  getMulticallAddress,
  getMulticallV2Address,
  getHULKReferralAddress,
  // getNftMarketAddress,
  // getNftSaleAddress, getPancakeProfileAddress,
  // getPancakeRabbitsAddress, getPancakeSquadAddress,
  // getPointCenterIfoAddress, getPredictionsAddress,
  // getTradingCompetitionAddress, getTradingCompetitionAddressMobox,
  // getTradingCompetitionAddressV2
} from './addressHelpers'
// ABI
import lpTokenAbi from '../config/abi/lpToken.json'
import hulkAbi from '../config/abi/hulk.json'
import masterChef from '../config/abi/masterchef.json'
import masterChefV1 from '../config/abi/masterchefV1.json'
import MultiCallAbi from '../config/abi/Multicall.json'
import MultiCallV2Abi from '../config/abi/MulticallV2.json'
import HULKReferralAbi from '../config/abi/HULKReferral.json'
import bep20Abi from '../config/abi/erc20.json'

import { simpleRpcProvider } from './contracts'

export const getContract = (abi: any, address: string, signer?: Signer | Provider) => {
  const signerOrProvider = signer ?? simpleRpcProvider
  return new Contract(address, abi, signerOrProvider)
}

export const getLPContract = (address: string, signer?: Signer | Provider) => {
  return getContract(lpTokenAbi, address, signer)
}
export const getHULKTokenContract = (signer?: Signer | Provider) => {
  return getContract(hulkAbi, tokens.hulktoken.address, signer)
}
export const getMasterchefContract = (signer?: Signer | Provider) => {
  return getContract(masterChef, getMasterChefAddress(), signer)
}
export const getMasterchefV1Contract = (signer?: Signer | Provider) => {
  return getContract(masterChefV1, getMasterChefV1Address(), signer)
}
export const getMulticallContract = () => {
  return getContract(MultiCallAbi, getMulticallAddress(), simpleRpcProvider)
}
export const getMulticallV2Contract = () => {
  return getContract(MultiCallV2Abi, getMulticallV2Address(), simpleRpcProvider)
}
export const getHULKReferralContract = () => {
  return getContract(HULKReferralAbi, getHULKReferralAddress(), simpleRpcProvider)
}

export const getBep20Contract = (address: string, signer?: Signer | Provider) => {
  if (address === '') return null
  return getContract(bep20Abi, address, signer)
}
