import React from 'react'
import { ModalProvider } from '@hulkfinance/hulk-uikit'
import { Provider } from 'react-redux'
import { Web3ReactProvider } from '@web3-react/core'
import ToastProvider from './contexts/ToastContext'
import { getLibrary } from './utils/web3React'
import { LanguageContextProvider } from './contexts/Localisation/languageContext'
import store from './state'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/Localisation'

const Providers: React.FC = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Provider store={store}>
        <ToastProvider>
          <ThemeContextProvider>
            <LanguageProvider>
              <LanguageContextProvider>
                <ModalProvider>{children}</ModalProvider>
              </LanguageContextProvider>
            </LanguageProvider>
          </ThemeContextProvider>
        </ToastProvider>
      </Provider>
    </Web3ReactProvider>
  )
}

export default Providers
