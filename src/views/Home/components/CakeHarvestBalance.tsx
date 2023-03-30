import React from 'react'
import { Text } from '@hulkfinance/hulk-uikit'
import CardValue from './CardValue'
import useI18n from '../../../hooks/useI18n'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'

const CakeHarvestBalance = ({ earningsSum }: any) => {
  const TranslateString = useI18n()
  const { account } = useActiveWeb3React()

  if (!account) {
    return (
      <Text color="textDisabled" style={{ lineHeight: 1, marginBottom: 16 }}>
        {TranslateString('Locked', 'Locked')}
      </Text>
    )
  }

  return <CardValue value={earningsSum} />
}

export default CakeHarvestBalance
