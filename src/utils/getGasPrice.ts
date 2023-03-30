import { ChainId } from '@hulkfinance/hulk-swap-sdk'
import store from '../state'
import { GAS_PRICE_GWEI } from '../state/types'
import {defaultChainId} from "../config";

/**
 * Function to return gasPrice outwith a react component
 */
const getGasPrice = (): string => {
  const chainId = defaultChainId.toString()
  const state = store.getState()
  const userGas = state.user.gasPrice || GAS_PRICE_GWEI.default
  return chainId === ChainId.MAINNET.toString() ? userGas : GAS_PRICE_GWEI.testnet
}

export default getGasPrice
