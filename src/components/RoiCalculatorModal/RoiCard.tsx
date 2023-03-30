import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import { CheckmarkIcon, IconButton, Text } from '@hulkfinance/hulk-uikit'
import { CalculatorMode, RoiCalculatorReducerState } from './useRoiCalculatorReducer'
import { useTranslation } from '../../contexts/Localisation'
import { Box, Flex } from '../Box'
import Input from './Input'
import { PencilIcon } from '../SVG'

const MILLION = 1000000
const TRILLION = 1000000000000

const RoiCardWrapper = styled(Box)`
  background: linear-gradient(180deg, #53dee9, #7645d9);
  padding: 1px;
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.default};
`

const RoiCardInner = styled(Box)`
  min-height: 120px;
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.default};
  background: ${({ theme }) => theme.colors.gradients.bubblegum};
`

const RoiInputContainer = styled(Box)`
  position: relative;
  & > input {
    padding-left: 28px;
    max-width: 70%;
  }
  &:before {
    position: absolute;
    content: '$';
    color: ${({ theme }) => theme.colors.textSubtle};
    left: 16px;
    top: 8px;
  }
`

const RoiDisplayContainer = styled(Flex)`
  max-width: 82%;
  margin-right: 8px;
`

const RoiDollarAmount = styled(Text)<{ fadeOut: boolean }>`
  position: relative;
  overflow-x: auto;
  word-break: break-all;
  &::-webkit-scrollbar {
    height: 0px;
  }

  ${({ fadeOut, theme }) =>
    fadeOut &&
    `
      &:after {
        background: linear-gradient(
          to right,
          ${theme.colors.background}00,
          ${theme.colors.background}E6
        );
        content: '';
        height: 100%;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;
        width: 40px;
      }
  `}
`

interface RoiCardProps {
  earningTokenSymbol: string
  calculatorState: RoiCalculatorReducerState
  setTargetRoi: (amount: string) => void
  setCalculatorMode: (mode: CalculatorMode) => void
}

const FlexStyled = styled(Flex)`
  min-height: 36px;
`

const TextStyled = styled(Text)`
  word-break: break-all;
`

const RoiCard: React.FC<RoiCardProps> = ({ earningTokenSymbol, calculatorState, setTargetRoi, setCalculatorMode }) => {
  const [expectedRoi, setExpectedRoi] = useState('')
  const inputRef = useRef<any>(null)
  const { roiUSD, roiTokens, roiPercentage } = calculatorState.data
  const { mode } = calculatorState.controls

  const { t } = useTranslation()

  useEffect(() => {
    if (mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI && inputRef.current !== null) {
      inputRef.current?.focus()
    }
  }, [mode])

  const onEnterEditing = () => {
    setCalculatorMode(CalculatorMode.PRINCIPAL_BASED_ON_ROI)
    setExpectedRoi(
      roiUSD.toLocaleString('en', {
        minimumFractionDigits: roiUSD > MILLION ? 0 : 2,
        maximumFractionDigits: roiUSD > MILLION ? 0 : 2,
      }),
    )
  }

  const onExitRoiEditing = () => {
    setCalculatorMode(CalculatorMode.ROI_BASED_ON_PRINCIPAL)
  }
  const handleExpectedRoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.validity.valid) {
      const roiAsString = event.target.value.replace(/,/g, '.')
      setTargetRoi(roiAsString)
      setExpectedRoi(roiAsString)
    }
  }
  return (
    <RoiCardWrapper>
      <RoiCardInner>
        <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
          {t('ROI at current rates')}
        </Text>
        <FlexStyled justifyContent="space-between" mt="4px">
          {mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI ? (
            <>
              <RoiInputContainer>
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  pattern="^[0-9]+[.,]?[0-9]*$"
                  scale="sm"
                  value={expectedRoi}
                  placeholder="0.0"
                  onChange={handleExpectedRoiChange}
                />
              </RoiInputContainer>
              <IconButton size="sm" variant="text" onClick={onExitRoiEditing}>
                <CheckmarkIcon color="primary" />
              </IconButton>
            </>
          ) : (
            <>
              <RoiDisplayContainer onClick={onEnterEditing}>
                {/* Dollar sign is separate cause its not supposed to scroll with a number if number is huge */}
                <Text fontSize="24px" bold>
                  $
                </Text>
                <RoiDollarAmount fontSize="24px" bold fadeOut={roiUSD > TRILLION}>
                  {roiUSD.toLocaleString('en', {
                    minimumFractionDigits: roiUSD > MILLION ? 0 : 2,
                    maximumFractionDigits: roiUSD > MILLION ? 0 : 2,
                  })}
                </RoiDollarAmount>
              </RoiDisplayContainer>
              <IconButton variant="text" onClick={onEnterEditing}>
                <PencilIcon color="primary" />
              </IconButton>
            </>
          )}
        </FlexStyled>
        <TextStyled fontSize="12px" color="textSubtle">
          ~ {roiTokens} {earningTokenSymbol} (
          {roiPercentage.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          %)
        </TextStyled>
      </RoiCardInner>
    </RoiCardWrapper>
  )
}

export default RoiCard
