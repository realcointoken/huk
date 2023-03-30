import React, { useEffect, Suspense, lazy, useContext, useCallback } from 'react'
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom'
import { isAddress } from 'ethers/lib/utils'
import { ResetCSS, ToastContainer } from '@hulkfinance/hulk-uikit'
import BigNumber from 'bignumber.js'
import GlobalStyle from './style/Global'
import Menu from './components/Menu'
import PageLoader from './components/PageLoader'
import { ToastContext } from './contexts/ToastContext'
import useReferral from './hooks/useReferral'
import useActiveWeb3React from './hooks/useActiveWeb3React'

import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import useAuth from './hooks/useAuth'
import { usePollBlockNumber } from './state/block/hooks'
import { usePollCoreFarmData } from './state/farms/hooks'
import useUserAgent from './hooks/useUserAgent'
import { ConnectorNames } from './utils/web3React'
import { storageConnectorKey } from './config'

// Route-based code splitting
// Only pool is included in the main bundle because of it's the most visited page'
const Home = lazy(() => import('./views/Home'))
const Referral = lazy(() => import('./views/Referral'))
const PreSale = lazy(() => import('./views/PreSale'))
const Farms = lazy(() => import('./views/Farms'))
const Pools = lazy(() => import('./views/Pools'))
const NotFound = lazy(() => import('./views/NotFound'))

// This config is required for number formating
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const App: React.FC = () => {
  usePollBlockNumber()
  usePollCoreFarmData()
  useUserAgent()
  const { account } = useActiveWeb3React()
  const { login } = useAuth()
  const { onSaveAffiliateAddress } = useReferral()
  const { toasts, removeToast } = useContext(ToastContext)
  useEffect(() => {
    const provider = localStorage.getItem(storageConnectorKey)
    if (provider) {
      // console.log(provider)
      login(provider || ConnectorNames.Injected)
    }
  }, [login])

  // useFetchPublicData()

  const saveAffiliateHandler = useCallback(
    (search: string) => {
      // console.log(search)
      if (search !== '') {
        const searchSplit = search.split('=')
        if (searchSplit.length > 1) {
          const affiliateAddress = searchSplit[1]

          if (isAddress(affiliateAddress) && affiliateAddress !== account) {
            // console.log(affiliateAddress)
            onSaveAffiliateAddress(affiliateAddress)
          }
        }
      }
    },
    [account, onSaveAffiliateAddress],
  )

  useEffect(() => {
    // console.log(window.location.search)
    if (window.location.search) {
      saveAffiliateHandler(window.location.search)
    }
  }, [saveAffiliateHandler])

  useEffect(() => {
    const linkTW = document.querySelector('a[aria-label="Twitter"]')
    if (linkTW) {
      linkTW.attributes[2].nodeValue = 'https://twitter.com/hulk_finance?t=OJRRWyiKQiighQ8MRgHxKg&s=35'
    }
    const linkTG = document.querySelector('a[aria-label="Telegram"]')
    if (linkTG) {
      linkTG.attributes[2].nodeValue = 'https://t.me/HulkFinance_DEFI'
    }
  }, [])

  return (
    <>
      <ListsUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <Router>
        <ResetCSS />
        <GlobalStyle />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <Menu>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" exact>
                <Home />
              </Route>
              {/* <Route path='/pre-sale' exact> */}
              {/*  <PreSale /> */}
              {/* </Route> */}
              <Route path="/farms">
                <Farms />
              </Route>
              <Route path="/pools">
                <Pools />
              </Route>
              <Route path="/referral">
                <Referral />
              </Route>
              {/* 404 */}
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </Menu>
      </Router>
    </>
  )
}

export default React.memo(App)
