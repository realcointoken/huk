import { ChainId } from '@hulkfinance/hulk-swap-sdk'
import {nodes} from "../utils/contracts";

const networks: {[chainId in ChainId | string | number]: any} = {
    [ChainId.MAINNET]: {
        chainId: `0x${(56).toString(16)}`,
        chainName: 'Binance Smart Chain Mainnet',
        nativeCurrency: {
            decimals: 18,
            symbol: 'BNB',
            name: 'Binance'
        },
        rpcUrls: nodes[56],
        blockExplorerUrls: ['https://bscscan.com/'],
    },
    [ChainId.BSCTESTNET]: {
        chainId: `0x${(97).toString(16)}`,
        chainName: 'Binance Smart Chain Testnet',
        nativeCurrency: {
            decimals: 18,
            symbol: 'BNB',
            name: 'Binance'
        },
        rpcUrls: nodes[97],
        blockExplorerUrls: ['https://testnet.bscscan.com/'],
    }
}

export {networks}