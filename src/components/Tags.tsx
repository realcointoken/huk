import React from 'react'
import { Tag, VerifiedIcon, CommunityIcon, BinanceIcon } from '@hulkfinance/hulk-uikit'
import useI18n from '../hooks/useI18n'

const NoFeeTag = () => {
  const TranslateString = useI18n()
  return (
    <Tag variant="success" outline startIcon={<VerifiedIcon />}>
      {TranslateString('No Fees', 'No Fees')}
    </Tag>
  )
}

const RiskTag = ({ risk }: any) => {
  const TranslateString = useI18n()
  return (
    <Tag variant={risk >= 3 ? 'failure' : 'success'} outline startIcon={<VerifiedIcon />}>
      {TranslateString('Risk', 'Risk')} {risk}
    </Tag>
  )
}

const CoreTag = () => {
  const TranslateString = useI18n()
  return (
    <Tag variant="secondary" outline startIcon={<VerifiedIcon />}>
      {TranslateString('Core', 'Core')}
    </Tag>
  )
}
const CommunityTag = () => {
  const TranslateString = useI18n()
  return (
    <Tag variant="textSubtle" outline startIcon={<CommunityIcon />}>
      {TranslateString('Community', 'Community')}
    </Tag>
  )
}

const BinanceTag = () => (
  <Tag variant="binance" outline startIcon={<BinanceIcon />}>
    Binance
  </Tag>
)

export { CoreTag, CommunityTag, BinanceTag, RiskTag, NoFeeTag }
