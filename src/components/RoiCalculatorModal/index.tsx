import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { Button, ButtonMenu, ButtonMenuItem, Checkbox, Flex, Modal, Text } from '@hulkfinance/hulk-uikit'
import RoiCalculatorFooter from './RoiCalculatorFooter'
import RoiCard from './RoiCard'
import useRoiCalculatorReducer, {
  CalculatorMode,
  DefaultCompoundStrategy,
  EditingCurrency,
} from './useRoiCalculatorReducer'
import AnimatedArrow from './AnimatedArrow'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useTranslation } from '../../contexts/Localisation'
import { getBalanceNumber } from '../../utils/formatBalance'
import BalanceInput from './BalanceInput'

export interface RoiCalculatorModalProps {
  onDismiss?: () => void
  onBack?: () => void
  earningTokenPrice: number
  apr?: number
  apy?: number
  displayApr?: string
  linkLabel: string
  linkHref: string
  stakingTokenBalance: BigNumber
  stakingTokenSymbol: string
  stakingTokenPrice: number
  earningTokenSymbol?: string
  multiplier?: string
  autoCompoundFrequency?: number
  performanceFee?: number
  isFarm?: boolean
  initialState?: any
  initialValue?: string
  strategy?: any
  header?: React.ReactNode
}

const StyledModal = styled(Modal)`
  & > :nth-child(2) {
    padding: 0;
  }
`

const ScrollableContainer = styled.div`
  //padding: 24px;
  //max-height: 500px;
  overflow-y: auto;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-height: none;
  }
`

const FullWidthButtonMenu = styled(ButtonMenu)<{ disabled?: boolean }>`
  max-width: 100%;

  & > button {
    width: 100%;
  }

  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`

const ButtonMenuItemStyled = styled(ButtonMenuItem)`
  padding: 0 8px !important;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 0 16px !important;
  }
`

const FlexStyled = styled(Flex)`
  flex-wrap: wrap;
  button {
    margin-bottom: 8px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    flex-wrap: nowrap;
    button {
      margin-bottom: 0;
    }
  }
`

const FlexCardStyled = styled(Flex)`
  max-width: 310px;
`

const RoiCalculatorModal: React.FC<RoiCalculatorModalProps> = ({
  onDismiss,
  onBack,
  earningTokenPrice,
  apr,
  apy,
  displayApr,
  linkLabel,
  linkHref,
  stakingTokenBalance,
  stakingTokenSymbol,
  stakingTokenPrice,
  multiplier,
  initialValue,
  earningTokenSymbol = 'HULK',
  autoCompoundFrequency = 0,
  performanceFee = 0,
  isFarm = false,
  initialState,
  strategy,
  header,
  children,
}) => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

  const {
    state,
    setPrincipalFromUSDValue,
    setPrincipalFromTokenValue,
    setStakingDuration,
    toggleCompounding,
    toggleEditingCurrency,
    setCompoundingFrequency,
    setCalculatorMode,
    setTargetRoi,
    dispatch,
  } = useRoiCalculatorReducer(
    { stakingTokenPrice, earningTokenPrice, autoCompoundFrequency: autoCompoundFrequency || 0 },
    initialState,
  )

  const { compounding, activeCompoundingIndex, stakingDuration, editingCurrency } = state.controls
  const { principalAsUSD, principalAsToken } = state.data

  // If user comes to calculator from staking modal - initialize with whatever they put in there
  useEffect(() => {
    if (initialValue) {
      setPrincipalFromTokenValue(initialValue)
    }
  }, [initialValue, setPrincipalFromTokenValue])

  const onBalanceFocus = () => {
    setCalculatorMode(CalculatorMode.ROI_BASED_ON_PRINCIPAL)
  }

  const editingUnit = editingCurrency === EditingCurrency.TOKEN ? stakingTokenSymbol : 'USD'
  const editingValue = editingCurrency === EditingCurrency.TOKEN ? principalAsToken : principalAsUSD
  const conversionUnit = editingCurrency === EditingCurrency.TOKEN ? 'USD' : stakingTokenSymbol
  const conversionValue = editingCurrency === EditingCurrency.TOKEN ? principalAsUSD : principalAsToken
  const onUserInput = editingCurrency === EditingCurrency.TOKEN ? setPrincipalFromTokenValue : setPrincipalFromUSDValue

  const DURATION = useMemo(() => [t('1D'), t('7D'), t('30D'), t('1Y'), t('5Y')], [t])

  return (
    <StyledModal title={t('ROI Calculator')} onDismiss={onBack || onDismiss} onBack={onBack}>
      <ScrollableContainer>
        {strategy ? (
          strategy(state, dispatch)
        ) : (
          <DefaultCompoundStrategy
            apr={apy ?? apr}
            dispatch={dispatch}
            state={state}
            earningTokenPrice={earningTokenPrice}
            performanceFee={performanceFee}
            stakingTokenPrice={stakingTokenPrice}
          />
        )}
        {header}
        <Flex flexDirection="column" mb="8px">
          <Text color="secondary" bold fontSize="12px" textTransform="uppercase">
            {t('%asset% staked', { asset: stakingTokenSymbol })}
          </Text>
          <BalanceInput
            inputProps={{
              size: 'sm',
            }}
            currencyValue={`${conversionValue} ${conversionUnit}`}
            placeholder="0.00"
            value={editingValue}
            unit={editingUnit}
            onUserInput={onUserInput}
            switchEditingUnits={toggleEditingCurrency}
            onFocus={onBalanceFocus}
          />
          <FlexStyled justifyContent="space-between" mt="8px">
            <Button size="sm" p="4px 16px" variant="tertiary" onClick={() => setPrincipalFromUSDValue('100')}>
              $100
            </Button>
            <Button size="sm" p="4px 16px" variant="tertiary" onClick={() => setPrincipalFromUSDValue('1000')}>
              $1000
            </Button>
            <Button
              disabled={
                !Number.isFinite(stakingTokenPrice) ||
                !stakingTokenBalance.isFinite() ||
                stakingTokenBalance.lte(0) ||
                !account
              }
              size="sm"
              p="4px 16px"
              variant="tertiary"
              onClick={() =>
                setPrincipalFromUSDValue(getBalanceNumber(stakingTokenBalance.times(stakingTokenPrice)).toString())
              }
            >
              {t('My Balance').toLocaleUpperCase()}
            </Button>
          </FlexStyled>
          {children || (
            <>
              <Text mt="24px" color="secondary" bold fontSize="12px" textTransform="uppercase">
                {t('Staked for')}
              </Text>
              <FullWidthButtonMenu activeIndex={stakingDuration} onClick={setStakingDuration} size="sm">
                {DURATION.map((duration) => (
                  <ButtonMenuItemStyled key={duration} variant="tertiary">
                    {duration}
                  </ButtonMenuItemStyled>
                ))}
              </FullWidthButtonMenu>
            </>
          )}
          {autoCompoundFrequency === 0 && (
            <>
              <Text mt="24px" color="secondary" bold fontSize="12px" textTransform="uppercase">
                {t('Compounding every')}
              </Text>
              <Flex alignItems="center">
                <Flex flex="1">
                  <Checkbox checked={compounding} onChange={toggleCompounding} />
                </Flex>
                <Flex flex="6">
                  <FullWidthButtonMenu
                    disabled={!compounding}
                    activeIndex={activeCompoundingIndex}
                    onClick={setCompoundingFrequency}
                    size="sm"
                  >
                    <ButtonMenuItemStyled>{t('1D')}</ButtonMenuItemStyled>
                    <ButtonMenuItemStyled>{t('7D')}</ButtonMenuItemStyled>
                    <ButtonMenuItemStyled>{t('14D')}</ButtonMenuItemStyled>
                    <ButtonMenuItemStyled>{t('30D')}</ButtonMenuItemStyled>
                  </FullWidthButtonMenu>
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
        <AnimatedArrow calculatorState={state} />
        <FlexCardStyled>
          <RoiCard
            earningTokenSymbol={earningTokenSymbol}
            calculatorState={state}
            setTargetRoi={setTargetRoi}
            setCalculatorMode={setCalculatorMode}
          />
        </FlexCardStyled>
      </ScrollableContainer>
      <RoiCalculatorFooter
        isFarm={isFarm}
        apr={apr || 0}
        apy={apy || 0}
        displayApr={displayApr || ''}
        autoCompoundFrequency={autoCompoundFrequency}
        multiplier={multiplier || '1x'}
        linkLabel={linkLabel}
        linkHref={linkHref}
        performanceFee={performanceFee}
      />
    </StyledModal>
  )
}

export default RoiCalculatorModal
