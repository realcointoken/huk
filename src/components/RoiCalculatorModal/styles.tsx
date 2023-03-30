import React from 'react'
import styled from 'styled-components'
import { IconButton, Text } from '@hulkfinance/hulk-uikit'
import { BalanceInputProps } from './types'
import Input from './Input'

export const SwitchUnitsButton = styled(IconButton)`
  width: 16px;
`

export const UnitContainer = styled(Text)`
  margin-left: 4px;
  text-align: right;
  color: ${({ theme }) => theme.colors.textSubtle};
  white-space: nowrap;
`

export const StyledBalanceInput = styled.div<{ isWarning: BalanceInputProps['isWarning'] }>`
  background-color: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 16px;
  box-shadow: ${({ theme, isWarning }) => theme.shadows[isWarning ? 'warning' : 'inset']};
  padding: 8px 16px;
`

export const StyledInput = styled(Input)<{ textAlign?: string }>`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding-left: 0;
  padding-right: 0;
  text-align: ${({ textAlign = 'right' }) => textAlign};
  border: none;

  ::placeholder {
    color: ${({ theme }) => theme.colors.textSubtle};
  }

  &:focus:not(:disabled) {
    box-shadow: none;
  }
`
