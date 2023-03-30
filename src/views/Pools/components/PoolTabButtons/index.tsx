import React from 'react'
import styled from 'styled-components'
import { ButtonMenu, ButtonMenuItem, Text, Toggle } from '@hulkfinance/hulk-uikit'
import useI18n from '../../../../hooks/useI18n'

interface PoolTabButtonsProps {
  stakedOnly: boolean
  setStakedOnly: (arg: boolean) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
}

const PoolTabButtons = ({ stakedOnly, setStakedOnly, isActive, setIsActive }: PoolTabButtonsProps) => {
  const TranslateString = useI18n()
  return (
    <Wrapper>
      <ToggleWrapper>
        <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} />
        <Text> {TranslateString('Staked only', 'Staked only')}</Text>
      </ToggleWrapper>
      {/* <ButtonMenu activeIndex={isActive ? 0 : 1} size="sm" variant="subtle" onClick={() => setIsActive(!isActive)}>
        <ButtonMenuItem as="button">{TranslateString('Active', 'Active')}</ButtonMenuItem>
        <ButtonMenuItem as="button">{TranslateString('Inactive', 'Inactive')}</ButtonMenuItem>
      </ButtonMenu> */}
    </Wrapper>
  )
}

export default PoolTabButtons

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
`

const ToggleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 32px;

  ${Text} {
    margin-left: 8px;
  }
`
