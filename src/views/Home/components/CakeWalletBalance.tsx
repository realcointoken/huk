import React from 'react'
import { Text } from '@hulkfinance/hulk-uikit'
import CardValue from './CardValue'
import useI18n from '../../../hooks/useI18n'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'

const CakeWalletBalance = ({ cakeBalance }: any) => {
  const TranslateString = useI18n()
  const { account } = useActiveWeb3React()

  if (!account) {
    return (
      <Text color="textDisabled" style={{ lineHeight: '36px' }}>
        {TranslateString('Locked', 'Locked')}
      </Text>
    )
  }

  return <CardValue value={cakeBalance} fontSize="24px" />
}

export default CakeWalletBalance
