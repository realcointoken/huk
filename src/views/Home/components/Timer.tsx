/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo } from 'react'
import { Text } from '@hulkfinance/hulk-uikit'
import styled from 'styled-components'
import { useTimer } from 'react-timer-hook'
import { addZeroForward } from '../../../utils'
import useI18n from '../../../hooks/useI18n'

const TimerStyled = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 56px;
`

const TimerBlock = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
`

const DateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  align-content: center;
  margin: 0 8px;
`

const DateValue = styled(Text)`
  font-size: 40px;
  font-weight: bold;
  line-height: 1;
  color: ${({ theme }) => theme.colors.primary};
`

const DateName = styled(Text)`
  font-size: 14px;
  margin-top: 8px;
  line-height: 1;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
`

const Separator = styled(Text)`
  font-size: 60px;
  font-weight: bold;
  line-height: 1;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 8px;
`
function Timer() {
  const TranslateString = useI18n()
  const timestamp: number = useMemo(() => {
    return 1
  }, [])

  const time = useMemo(() => {
    return new Date(timestamp)
  }, [timestamp])
  const { days, hours, minutes, restart } = useTimer({
    expiryTimestamp: time,
    autoStart: true,
    onExpire: () => {
      // console.log('finish')
    },
  })

  useEffect(() => {
    restart(time, true)
  }, [time])
  return (
    <TimerStyled>
      <TimerBlock>
        <DateBlock>
          {/* <DateValue>{addZeroForward(days.toString())}</DateValue> */}
          <DateValue>{addZeroForward(days.toString())}</DateValue>
          <DateName>{TranslateString('days', 'days')}</DateName>
        </DateBlock>
        <Separator>:</Separator>
        <DateBlock>
          <DateValue>{addZeroForward(hours.toString())}</DateValue>
          <DateName>{TranslateString('hours', 'hours')}</DateName>
        </DateBlock>
        <Separator>:</Separator>
        <DateBlock>
          <DateValue>{addZeroForward(minutes.toString())}</DateValue>
          <DateName>{TranslateString('minutes', 'minutes')}</DateName>
        </DateBlock>
      </TimerBlock>
      {/* <TimerText><span>Finish:</span> 3d 9h 44m (blocks)</TimerText> */}
    </TimerStyled>
  )
}

export default Timer
