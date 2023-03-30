import React from 'react'
import styled from 'styled-components'
import { Card, CardBody, Heading, Text } from '@hulkfinance/hulk-uikit'
import calendar from '../../../assets/images/calendar.png'

const TimelineStyledCard = styled(Card)`
  margin-left: auto;
  margin-right: auto;
`

const CardHeading = styled(Heading)`
  font-size: 28px;
  font-weight: 900;
  @media (min-width: 768px) {
    font-size: 40px;
  }
`

const TimelineText = styled(Text)`
  font-size: 20px;
  margin-bottom: 16px;
  span {
    color: ${({ theme }) => theme.colors.primary};
  }
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.tertiary};
  }
`

const Round = styled.div`
  display: flex;
  align-content: flex-start;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  img {
    width: 54px;
  }
  @media (min-width: 768px) {
    flex-direction: row;
    align-content: flex-start;
    align-items: flex-start;
    justify-content: flex-start;
  }
`

const RoundDesc = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 8px;
  @media (min-width: 768px) {
    margin-left: 24px;
    margin-top: 0;
  }
`
function Timeline() {
  return (
    <TimelineStyledCard>
      <CardBody p={40}>
        <CardHeading mb="24px">TIMELINE</CardHeading>
        <TimelineText>
          <span>HULK token</span> will be distributed block by block from Feb 4th, 2022 ( 30% each month)
        </TimelineText>
        <Round>
          <img src={calendar} alt="calendar" />
          <RoundDesc>
            <CardHeading mb="8px">PRESALE 1</CardHeading>
            <TimelineText>
              <span>Nov 3rd, 2021 - Dec 2nd, 2021</span>
              <p>Amount: 33,000,000,000 HULK Unit Price: $0.00001</p>
            </TimelineText>
          </RoundDesc>
        </Round>
        <Round>
          <img src={calendar} alt="calendar" />
          <RoundDesc>
            <CardHeading mb="8px">ROUND 1</CardHeading>
            <TimelineText>
              <span>Nov 3rd, 2021 - Dec 2nd, 2021</span>
              <p>Amount: 33,000,000,000 HULK Unit Price: $0.00001</p>
            </TimelineText>
          </RoundDesc>
        </Round>
      </CardBody>
    </TimelineStyledCard>
  )
}

export default Timeline
