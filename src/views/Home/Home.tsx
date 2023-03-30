import React from 'react'
import styled from 'styled-components'
import { Heading, Text, BaseLayout } from '@hulkfinance/hulk-uikit'
import FarmStakingCard from './components/FarmStakingCard'
import CakeStats from './components/CakeStats'
import TotalValueLockedCard from './components/TotalValueLockedCard'
import TwitterCard from './components/TwitterCard'
import Timer from './components/Timer'
import PreSale from './components/PreSale'
import useI18n from '../../hooks/useI18n'
import Page from '../../components/layout/Page'

const Banner = styled.div`
  width: 100%;
  height: 186px;
  //background-image: url('../../assets/images/home_banner.png');
  background: url('/images/home_banner.png'), linear-gradient(180deg, #082407 0%, #0a0d0f 100%);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: auto 100%;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const BannerHeading = styled(Heading)`
  font-size: 48px;
  font-weight: 900;
  line-height: 1.2;
`

const BannerText = styled(Text)`
  margin-top: 16px;
  font-size: 20px;
  text-align: center;
`

const Cards = styled(BaseLayout)`
  align-items: stretch;
  justify-content: stretch;
  margin-bottom: 48px;

  & > div {
    grid-column: span 6;
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & > div {
      grid-column: span 8;
    }
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    & > div {
      grid-column: span 6;
    }
  }
`

const Home: React.FC = () => {
  const TranslateString = useI18n()

  return (
    <>
      <Banner>
        <BannerHeading as="h1" mb="0" color="secondary">
          {TranslateString('HulkFinance', 'HulkFinance')}
        </BannerHeading>
        <BannerText color="primary">
          {TranslateString(
            'The First Automatic Liquidity Acquisition Yield Farm.',
            'The First Automatic Liquidity Acquisition Yield Farm.',
          )}
        </BannerText>
      </Banner>
      <Timer />
      <Page>
        <div>
          <PreSale />
          <Cards>
            <FarmStakingCard />
            <TwitterCard />
            <TotalValueLockedCard />
            <CakeStats />
          </Cards>
        </div>
      </Page>
    </>
  )
}

export default Home
