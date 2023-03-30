import React from 'react'
import { Button, Card, Heading, Text } from '@hulkfinance/hulk-uikit'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import useI18n from '../../../hooks/useI18n'

const PreSaleStyled = styled(Card)`
  border: 3px solid ${({ theme }) => theme.colors.primary};
  padding: 40px;
  margin-bottom: 46px;
  margin-top: 8px;
`

const CardHeading = styled(Heading)`
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 0;
  @media (min-width: 768px) {
    font-size: 40px;
  }
`

const List = styled.div`
  margin-top: 35px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;
`

const Row = styled.div`
  align-items: flex-end;
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin-bottom: 16px;
  width: 100%;
  span {
    display: block;
    height: 100%;
    border-bottom: 1px solid ${({ theme }) => theme.colors.tertiary};
    flex: 1;
    margin: 0 4px;
  }
  &:last-child {
    margin-bottom: 0;
  }
`

const RowText = styled(Text)`
  font-size: 20px;
  line-height: 1.2;
`
function PreSale() {
  const TranslateString = useI18n()
  return (
    <PreSaleStyled>
      <CardHeading size="xl" mb="24px">
        {TranslateString('Token Pre-Sale', 'Token Pre-Sale')}
      </CardHeading>
      <a href="https://www.pinksale.finance/" target="_blank" rel="noreferrer">
        <Button mt={32} fullWidth>
          {TranslateString('Presale', 'PreSale')}
        </Button>
      </a>
      <List>
        <Row>
          <RowText>{TranslateString('Launch Time', 'Launch Time')}</RowText>
          <span />
          <RowText>Dec 5th, 9AM UTC</RowText>
        </Row>
        {/* <Row>
          <RowText>IDO DFI {TranslateString('Price', 'Price')}</RowText>
          <span />
          <RowText>0.1 USD/DFI</RowText>
        </Row> */}
        {/* <Row>
          <RowText>{TranslateString('Funds to raise:', 'Funds to raise')} (BUSD)</RowText>
          <span />
          <RowText>100,000 BUSD</RowText>
        </Row> */}
        <Row>
          <RowText>{TranslateString('For sale', 'For Sale')}</RowText>
          <span />
          <RowText>50,000,000 HULK</RowText>
        </Row>
        {/* <Row>
          <RowText>{TranslateString('Total committed:', 'Total committed')}</RowText>
          <span />
          <RowText>~$98,526 (98.53%)</RowText>
        </Row> */}
      </List>
    </PreSaleStyled>
  )
}

export default PreSale
