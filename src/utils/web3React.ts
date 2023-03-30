import {InjectedConnector} from '@web3-react/injected-connector'
import {Web3Provider} from "@ethersproject/providers";
import {WalletConnectConnector} from '@web3-react/walletconnect-connector'
import {ethers} from "ethers";
import {getNodeUrl} from "./contracts";
import {defaultChainId} from "../config";

const POLLING_INTERVAL = 12000

export enum ConnectorNames {
    Injected = "injected",
    WalletConnect = "walletconnect",
}

const injected = new InjectedConnector({ supportedChainIds: [defaultChainId] })


const walletconnect = new WalletConnectConnector({
    rpc: {[defaultChainId]: getNodeUrl() as string},
    qrcode: true,
    chainId: defaultChainId,
})

export const connectorsByName: {[connectorName in ConnectorNames | string]: any} = {
    [ConnectorNames.Injected]: injected,
    [ConnectorNames.WalletConnect]: walletconnect,
}

export const getLibrary = (provider: any): Web3Provider => {
    const library = new ethers.providers.Web3Provider(provider)
    library.pollingInterval = POLLING_INTERVAL
    return library
}