import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, Currency, CurrencyAmount, ETHER, Percent, Token } from '@hulkfinance/hulk-swap-sdk'
import JSBI from 'jsbi'
import { TokenAddressMap } from '../state/types'
import { BASE_BSC_SCAN_URLS, defaultChainId } from '../config'

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const inputRegexInt = RegExp(`^\\d*$`) // match escaped "." characters via in a non-capturing group
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const shortBalance = (balance: string, needLength = 6) => {
  const balanceArr = balance.split('.')
  if (balanceArr.length > 1) {
    const integerPart = balanceArr[0]
    const floatPart = balanceArr[1].length > needLength ? balanceArr[1].slice(0, needLength) : balanceArr[1]
    return `${integerPart}.${floatPart}`
  }
  return balance
}

export async function scrollToElement(event: any, href: string, isRedirect = false) {
  if (isRedirect) {
    await sleep(300)
  }
  const id = href.split('#')[1]
  if (id) {
    const element = document.getElementById(id)
    if (element) {
      const top = element.offsetTop
      window.scrollTo({
        top,
        behavior: 'smooth',
      })
    }
  }
}
export const shortAddress = (address: string) => {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

export const addZeroForward = (string: string, needLength = 2) => {
  return `${'0'.repeat(needLength - string.length)}${string}`
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const BSCSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  56: '',
  97: 'testnet.',
}

export function getBscScanLink(
  data: string | number,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainIdOverride?: number,
): string {
  const chainId = chainIdOverride || defaultChainId
  switch (type) {
    case 'transaction': {
      return `${BASE_BSC_SCAN_URLS[chainId]}/tx/${data}`
    }
    case 'token': {
      return `${BASE_BSC_SCAN_URLS[chainId]}/token/${data}`
    }
    case 'block': {
      return `${BASE_BSC_SCAN_URLS[chainId]}/block/${data}`
    }
    case 'countdown': {
      return `${BASE_BSC_SCAN_URLS[chainId]}/block/countdown/${data}`
    }
    default: {
      return `${BASE_BSC_SCAN_URLS[chainId]}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(Math.floor(num)), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string | null): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
// export function getRouterContract(_: number, library: Web3Provider, account?: string): Contract {
//     return getContract(ROUTER_ADDRESS, DogBossSideLiquidityRouterABI, library, account)
// }

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/${address}/logo.png`

export const dateFormat = (date: Date) => {
  const now = new Date()
  let dif = date.getTime() - now.getTime()
  if (dif <= 0) return 'available'
  const min = 60
  const hour = 60 * min
  const day = hour * 24
  if (dif <= 0) return '0'
  dif /= 1000
  if (dif >= day) return `${Math.floor(dif / day)} days`
  if (dif >= hour) return `${Math.floor(dif / hour)} hours`
  if (dif >= min) return `${Math.floor(dif / min)} mins`
  return `${dif.toFixed(0)} sec`
}
