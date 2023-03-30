import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { useCallback, useContext } from 'react'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector'
import { Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import { defaultChainId, storageConnectorKey } from '../config'
import { ConnectorNames, connectorsByName } from '../utils/web3React'
import { setupNetwork } from '../utils/wallet'
import { ToastContext } from '../contexts/ToastContext'

function useAuth() {
  const { activate, deactivate, chainId } = useWeb3React()
  const { addToast } = useContext(ToastContext)
  const defaultConnectorKey = window.localStorage.getItem(storageConnectorKey) || ConnectorNames.Injected

  const login = useCallback(
    async (connectorKey: ConnectorNames | string = defaultConnectorKey) => {
      const connector: any = connectorsByName[connectorKey]
      let success = true
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: `Auth`,
        description: ``,
        type: toastTypes.DANGER,
      }
      if (connector) {
        activate(connector, async (error) => {
          console.log(error.message || error)
          success = false
          localStorage.removeItem(storageConnectorKey)
          if (error instanceof UnsupportedChainIdError) {
            if (connectorKey === ConnectorNames.WalletConnect) {
              window.localStorage.removeItem('walletconnect')
              console.error('Unsupported ChainId. Change network, please!')
              toast.description = 'Unsupported ChainId. Change network, please!'
              addToast(toast)
              return
            }
            const hasSetup = await setupNetwork(defaultChainId)
            if (hasSetup) {
              await activate(connector)
              localStorage.setItem(storageConnectorKey, connectorKey)
              console.error('Change Network: Success')
              success = true
              toast.description = 'Change Network: Success'
              toast.type = toastTypes.SUCCESS
              addToast(toast)
            } else {
              deactivate()
              console.log(error.message)
              window.localStorage.removeItem(storageConnectorKey)
              // showAlert({text: error.message, cls: classAlert.error})
            }
          } else {
            deactivate()
            window.localStorage.removeItem(storageConnectorKey)
            window.localStorage.removeItem('walletconnect')
            if (error instanceof NoEthereumProviderError) {
              console.info(error.message || 'Provider Error')
            } else if (
              error instanceof UserRejectedRequestErrorInjected ||
              error instanceof UserRejectedRequestErrorWalletConnect
            ) {
              if (connector instanceof WalletConnectConnector) {
                const walletConnector = connector as WalletConnectConnector
                walletConnector.walletConnectProvider = undefined
              }
              console.error(error.message || 'Authorization Error')
              // showAlert({text: error.message || 'Authorization Error', cls: classAlert.error})
              toast.description = error.message || 'Authorization Error'
              addToast(toast)
            } else {
              console.error(error.message)
              window.localStorage.removeItem(storageConnectorKey)
              // showAlert({text: error.message, cls: classAlert.error})
            }
          }
        })
          .then(() => {
            if (success) {
              localStorage.setItem(storageConnectorKey, connectorKey)
            }
          })
          .catch((e) => {
            window.localStorage.removeItem(storageConnectorKey)
          })
      } else {
        console.info('Connector is Failed')
      }
    },
    [activate, addToast, deactivate, defaultConnectorKey],
  )

  const logout = useCallback(() => {
    window.localStorage.removeItem(storageConnectorKey)
    deactivate()
    window.localStorage.removeItem(storageConnectorKey)
    window.localStorage.removeItem('walletconnect')
  }, [deactivate])

  return {
    login,
    logout,
  }
}

export default useAuth
