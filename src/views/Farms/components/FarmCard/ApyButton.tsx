import React, { useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { CalculateIcon, Flex, IconButton, useModal } from '@hulkfinance/hulk-uikit'
import { useTranslation } from '../../../../contexts/Localisation'
import { useFarmUser, useLpTokenPrice } from '../../../../state/farms/hooks'
import RoiCalculatorModal from '../../../../components/RoiCalculatorModal'
import { BIG_ZERO } from '../../../../utils/bigNumber'

const ApyLabelContainer = styled(Flex)`
  cursor: pointer;

  &:hover {
    opacity: 0.5;
  }
`

export interface ApyButtonProps {
  variant: 'text' | 'text-and-button'
  pid: number
  lpSymbol: string
  lpLabel?: string
  multiplier: string
  hulkPrice?: BigNumber
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
}

const ApyButton: React.FC<ApyButtonProps> = ({
  variant,
  pid,
  lpLabel,
  lpSymbol,
  hulkPrice,
  apr,
  multiplier,
  displayApr,
  addLiquidityUrl,
}) => {
  const { t } = useTranslation()
  const lpPrice = useLpTokenPrice(lpSymbol)
  const farmUser = useFarmUser(pid)
  const { tokenBalance, stakedBalance } = useMemo(() => {
    if (farmUser) {
      return {
        tokenBalance: farmUser.tokenBalance,
        stakedBalance: farmUser.stakedBalance,
      }
    }
    return {
      tokenBalance: BIG_ZERO,
      stakedBalance: BIG_ZERO,
    }
  }, [farmUser])
  const [onPresentApyModal] = useModal(
    <RoiCalculatorModal
      linkLabel={t('Get %symbol%', { symbol: lpLabel || '?' })}
      stakingTokenBalance={stakedBalance.plus(tokenBalance)}
      stakingTokenSymbol={lpSymbol}
      stakingTokenPrice={lpPrice.toNumber()}
      earningTokenPrice={hulkPrice?.toNumber() || 0}
      apr={apr}
      multiplier={multiplier}
      displayApr={displayApr}
      linkHref={addLiquidityUrl || ''}
      isFarm
    />,
  )

  const handleClickButton = (event: any): void => {
    event.stopPropagation()
    onPresentApyModal()
  }

  return (
    <ApyLabelContainer alignItems="center" onClick={handleClickButton}>
      {displayApr}%
      {variant === 'text-and-button' && (
        <IconButton variant="text" ml="4px">
          <CalculateIcon width="18px" />
        </IconButton>
      )}
    </ApyLabelContainer>
  )
}

export default ApyButton
