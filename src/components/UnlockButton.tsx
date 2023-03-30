import React from 'react'
import { Button, useWalletModal } from '@hulkfinance/hulk-uikit'
import useI18n from '../hooks/useI18n'
import useAuth from '../hooks/useAuth'

const UnlockButton = (props: any) => {
  const TranslateString = useI18n()
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  return (
    <Button onClick={onPresentConnectModal} {...props}>
      {TranslateString('Connect Wallet', 'Connect Wallet')}
    </Button>
  )
}

export default UnlockButton
