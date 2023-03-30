import React, { useState } from 'react'
import styled from 'styled-components'
import { Flex, HelpIcon, LinkExternal, Text } from '@hulkfinance/hulk-uikit'
import { useTranslation } from '../../contexts/Localisation'
import { getApy } from '../../utils/compoundApyHelpers'
import { ExpandableLabel } from './ExpandableButton'
import { Box, Grid } from '../Box'
import useI18n from '../../hooks/useI18n'

const Footer = styled(Flex)`
  width: 100%;
  background: ${({ theme }) => theme.colors.card};
  max-width: 300px;
`

const BulletList = styled.ul`
  list-style-type: none;
  margin-top: 16px;
  padding: 0;
  li {
    margin: 0;
    padding: 0;
  }
  li::before {
    content: '•';
    margin-right: 4px;
    color: ${({ theme }) => theme.colors.textSubtle};
  }
  li::marker {
    font-size: 12px;
  }
`

interface RoiCalculatorFooterProps {
  isFarm: boolean
  apr: number
  apy: number
  displayApr: string
  autoCompoundFrequency: number
  multiplier: string
  linkLabel: string
  linkHref: string
  performanceFee: number
}

const TestStyled = styled(Text)<{ small?: boolean; textAlign?: string; display?: string; lineHeight?: number }>`
  font-size: ${({ small }) => (small ? 14 : 8)}px;
  text-align: ${({ textAlign }) => textAlign || 'left'};
  display: ${({ display }) => display || 'flex'};
  line-height: ${({ lineHeight }) => lineHeight || '1'};
`

const ExpandableLabelStyled = styled(ExpandableLabel)`
  margin: 0 auto;
`

const RoiCalculatorFooter: React.FC<RoiCalculatorFooterProps> = ({
  isFarm,
  apr,
  apy,
  displayApr,
  autoCompoundFrequency,
  multiplier,
  linkLabel,
  linkHref,
  performanceFee,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation()

  const gridRowCount = isFarm ? 4 : 2
  const TranslateString = useI18n()
  return (
    <Footer p="16px" flexDirection="column">
      <ExpandableLabelStyled expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)}>
        {isExpanded ? TranslateString('Hide', 'Hide') : TranslateString('Details', 'Details')}
      </ExpandableLabelStyled>
      {isExpanded && (
        <Box px="8px">
          <Grid gridTemplateColumns="2.5fr 1fr" gridRowGap="8px" gridTemplateRows={`repeat(${gridRowCount}, auto)`}>
            {isFarm && (
              <>
                <TestStyled color="textSubtle" small>
                  {t('APR (incl. LP rewards)')}
                </TestStyled>
                <TestStyled small textAlign="right">
                  {displayApr}%
                </TestStyled>
              </>
            )}
            {!Number.isFinite(apy) ? (
              <TestStyled color="textSubtle" small>
                {isFarm ? t('Base APR (CAKE yield only)') : t('APR')}
              </TestStyled>
            ) : (
              <TestStyled color="textSubtle" small>
                {t('APY')}
              </TestStyled>
            )}
            <TestStyled small textAlign="right">
              {(apy ?? apr).toFixed(2)}%
            </TestStyled>
            {!Number.isFinite(apy) && (
              <TestStyled color="textSubtle" small>
                {t('APY (%compoundTimes%x daily compound)', {
                  compoundTimes: autoCompoundFrequency > 0 ? autoCompoundFrequency : 1,
                })}
              </TestStyled>
            )}
            {!Number.isFinite(apy) && (
              <TestStyled small textAlign="right">
                {(
                  getApy(apr, autoCompoundFrequency > 0 ? autoCompoundFrequency : 1, 365, performanceFee) * 100
                ).toFixed(2)}
                %
              </TestStyled>
            )}
            {isFarm && (
              <>
                <TestStyled color="textSubtle" small>
                  {t('Farm Multiplier')}
                </TestStyled>
                <Flex justifyContent="flex-end" alignItems="flex-end">
                  <TestStyled small textAlign="right" mr="4px">
                    {multiplier}
                  </TestStyled>
                </Flex>
              </>
            )}
          </Grid>
          <BulletList>
            <li>
              <TestStyled fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                {t('Calculated based on current rates.')}
              </TestStyled>
            </li>
            {isFarm && (
              <li>
                <TestStyled fontSize="12px" textAlign="center" color="textSubtle" display="inline">
                  {t('LP rewards: 0.17% trading fees, distributed proportionally among LP token holders.')}
                </TestStyled>
              </li>
            )}
            <li>
              <TestStyled fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                {t(
                  'All figures are estimates provided for your convenience only, and by no means represent guaranteed returns.',
                )}
              </TestStyled>
            </li>
            {performanceFee > 0 && (
              <li>
                <TestStyled mt="14px" fontSize="12px" textAlign="center" color="textSubtle" display="inline">
                  {t('All estimated rates take into account this pool’s %fee%% performance fee', {
                    fee: performanceFee,
                  })}
                </TestStyled>
              </li>
            )}
          </BulletList>
          <Flex justifyContent="center" mt="24px">
            <LinkExternal href={linkHref}>{linkLabel}</LinkExternal>
          </Flex>
        </Box>
      )}
    </Footer>
  )
}

export default RoiCalculatorFooter
