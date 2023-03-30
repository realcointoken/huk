import React from 'react'
import styled from 'styled-components'
import { Button } from '@hulkfinance/hulk-uikit'

interface PercentButtonsProps {
  handleSelectPercent: (percent: number) => void
}

const RowButtons = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`

const PercentButton = styled(Button)`
  font-size: 14px;
  line-height: 1;
  padding: 4px;
  margin: 0 4px;
  height: unset;
`

const percents: number[] = [25, 50, 75, 100]
function PercentButtons({ handleSelectPercent }: PercentButtonsProps) {
  return (
    <RowButtons>
      {percents.map((percent) => {
        return (
          <PercentButton key={percent} onClick={() => handleSelectPercent(percent)}>
            {percent}%
          </PercentButton>
        )
      })}
    </RowButtons>
  )
}

export default PercentButtons
