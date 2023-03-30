import React, { useEffect, useRef } from 'react'
import { useCountUp } from 'react-countup'
import { Text } from '@hulkfinance/hulk-uikit'
import styled from 'styled-components'

const CardValueText = styled(Text)<{ fontSize: string }>`
  line-height: 1.2;
  font-size: ${({ fontSize }) => fontSize || '28px'};
  @media (min-width: 768px) {
    font-size: ${({ fontSize }) => fontSize || '40px'};
  }
`

interface CardValueProps {
  value: number
  decimals?: number
  fontSize?: string
  prefix?: string
  bold?: boolean
}

const CardValue: React.FC<CardValueProps> = ({ value, decimals, fontSize = '40px', prefix, bold }) => {
  const { countUp, update } = useCountUp({
    start: 0,
    end: value,
    duration: 1,
    separator: ',',
    decimals:
      // eslint-disable-next-line no-nested-ternary
      decimals !== undefined ? decimals : value < 0 ? 4 : value > 1e5 ? 0 : 3,
  })

  const updateValue = useRef(update)

  useEffect(() => {
    updateValue.current(value)
  }, [value, updateValue])

  return (
    <CardValueText bold={bold} fontSize={fontSize}>
      {prefix}
      {countUp}
    </CardValueText>
  )
}

export default CardValue
