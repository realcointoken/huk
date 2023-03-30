import React from 'react'
import { Flex, SwapVertIcon, Text } from '@hulkfinance/hulk-uikit'
import { StyledBalanceInput, StyledInput, SwitchUnitsButton, UnitContainer } from './styles'
import { BalanceInputProps } from './types'

const BalanceInput: React.FC<BalanceInputProps> = ({
  value,
  placeholder = '0.0',
  onUserInput,
  currencyValue,
  inputProps,
  isWarning = false,
  decimals = 18,
  unit,
  switchEditingUnits,
  ...props
}) => {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.validity.valid) {
      onUserInput(e.currentTarget.value.replace(/,/g, '.'))
    }
  }

  return (
    <StyledBalanceInput isWarning={isWarning} {...props}>
      <Flex justifyContent="flex-end">
        <div>
          <Flex alignItems="center">
            <StyledInput
              pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
              inputMode="decimal"
              min="0"
              value={value.toString() || ''}
              onChange={handleOnChange}
              placeholder={placeholder}
              {...inputProps}
            />
            {unit && <UnitContainer>{unit}</UnitContainer>}
          </Flex>
          {currencyValue && (
            <Text fontSize="12px" color="textSubtle">
              {currencyValue}
            </Text>
          )}
        </div>
        {switchEditingUnits && (
          <Flex alignItems="center" pl="12px">
            <SwitchUnitsButton variant="text" onClick={switchEditingUnits}>
              <SwapVertIcon color="textSubtle" />
            </SwitchUnitsButton>
          </Flex>
        )}
      </Flex>
    </StyledBalanceInput>
  )
}

export default BalanceInput
