import { Contract, ethers } from 'ethers'
import random from 'lodash/random'
import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers'
import { defaultChainId } from '../config'

export const nodes: any = {
  56: ['https://bsc-dataseed1.ninicoin.io', 'https://bsc-dataseed1.defibit.io', 'https://bsc-dataseed.binance.org'],
  97: [
    // 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    'https://data-seed-prebsc-1-s2.binance.org:8545/',
    // 'https://data-seed-prebsc-2-s2.binance.org:8545/',
    // 'https://data-seed-prebsc-1-s3.binance.org:8545/',
    // 'https://data-seed-prebsc-2-s3.binance.org:8545/',
  ],
}
export const getNodeUrl = () => {
  const randomIndex = random(0, nodes[defaultChainId].length - 1)
  return nodes[defaultChainId][randomIndex]
}

const RPC_URL = getNodeUrl()

// export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL)
export const simpleRpcProvider = new ethers.providers.StaticJsonRpcProvider(RPC_URL)

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// export const getContract = (abi: any, address: string, signer?: ethers.Signer | ethers.providers.Provider): Contract => {
export const getContract = (abi: any, address: string, library: Web3Provider, account?: string): Contract | null => {
  if (address === '') return null
  const signerOrProvider = getProviderOrSigner(library, account) as any
  return new ethers.Contract(address, abi, signerOrProvider)
}
