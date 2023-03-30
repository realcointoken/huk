import React from 'react'
import { Card, CardBody, Heading } from '@hulkfinance/hulk-uikit'
import styled from 'styled-components'
import { Timeline } from 'react-twitter-widgets'
import useI18n from '../../../hooks/useI18n'
import useTheme from '../../../hooks/useTheme'

const StyledTwitterCard = styled(Card)`
  margin-left: auto;
  margin-right: auto;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin-bottom: 8px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  //height: 600px;
  & > div {
    flex: 1;
    height: 100%;
  }
  [twdiv='yes'] {
    height: 100%;
  }
`

const CardHeading = styled(Heading)`
  font-size: 28px;
  font-weight: 900;
  @media (min-width: 768px) {
    font-size: 40px;
  }
`

const TwitterCard = () => {
  const { theme } = useTheme()
  const TranslateString = useI18n()

  return (
    <StyledTwitterCard>
      <CardBody p={40}>
        <CardHeading mb="24px">{TranslateString('Announcements', 'Announcements')}</CardHeading>
        <Wrapper>
          <Timeline
            dataSource={{
              sourceType: 'profile',
              screenName: 'hulk_finance',
            }}
            options={{
              height: '440px',
              chrome: 'transparent, noheader, nofooter',
              width: '100%',
              theme: 'dark',
              borderColor: theme.colors.card,
            }}
          />
        </Wrapper>
      </CardBody>
    </StyledTwitterCard>
  )
}

export default TwitterCard
