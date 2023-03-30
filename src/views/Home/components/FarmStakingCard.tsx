import React, { useState, useCallback, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Heading, Card, CardBody, Button } from '@hulkfinance/hulk-uikit'
import BigNumber from 'bignumber.js/bignumber'
import { ethers } from 'ethers'
import CakeHarvestBalance from './CakeHarvestBalance'
import CakeWalletBalance from './CakeWalletBalance'
import { getBalanceNumber } from '../../../utils/formatBalance'
import hulkLogo from '../../../assets/images/HulkLogo.svg'
import metamaskLogo from '../../../assets/images/MetamaskIcon.svg'
import HomeFarm from '../../../assets/images/HomeFarmImage.png'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'
import useI18n from '../../../hooks/useI18n'
import { useTokenBalance } from '../../../state/wallet/hooks'
import UnlockButton from '../../../components/UnlockButton'
import { usePriceHULKBusd } from '../../../state/farms/hooks'
import { getHULKTokenAddress } from '../../../utils/addressHelpers'
import useFarmsWithBalance from '../hooks/useFarmsWithBalance'
import { useAllHarvest } from '../../../hooks/Farms/useHarvestFarm'
import tokens from '../../../config/constants/tokens'

const StyledFarmStakingCard = styled(Card)`
  min-height: 376px;
  position: relative;
`

const Block = styled.div`
  //margin-bottom: 16px;
`

const Label = styled.div`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 20px;
  line-height: 24px;
  font-weight: bold;
  margin-bottom: 16px;
`

const Actions = styled.div`
  margin-top: 24px;
  position: relative;
`

const CardImage = styled.img`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 0;
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`

const Token = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 32px;
`

const Metamask = styled.div`
  display: flex;
  padding: 11px 13px 11px 24px;
  background: rgba(255, 255, 255, 0.37);
  border-radius: 24px;
  margin-left: 16px;
  transition: background-color 0.25s ease;
  cursor: pointer;
  span {
    color: #fff;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 24px;
  }
  img {
    margin-left: 19px;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`

const CardHeading = styled(Heading)`
  font-size: 28px;
  font-weight: 900;
  @media (min-width: 768px) {
    font-size: 40px;
  }
`

const FarmedStakingCard = () => {
  const token: {
    symbol: string
    decimals: number
    address: string
    image?: string
  } = useMemo(() => {
    return {
      symbol: 'HULK',
      decimals: 18,
      address: getHULKTokenAddress(),
      // image: 'https://pbs.twimg.com/profile_images/802481220340908032/M_vde_oi_400x400.jpg',
    }
  }, [])
  const [pendingTx, setPendingTx] = useState(false)
  const { account, library } = useActiveWeb3React()
  const TranslateString = useI18n()
  const farmsWithBalance = useFarmsWithBalance()
  const hulkBalanceAmount = useTokenBalance(account || undefined, tokens.hulktoken)?.toSignificant(2)
  const hulkBalance: number = useMemo(() => {
    return parseFloat(hulkBalanceAmount || '0')
  }, [hulkBalanceAmount])
  const hulkPrice = usePriceHULKBusd().toNumber()
  const { earningsSum } = farmsWithBalance
  const balancesWithValue = farmsWithBalance.farmsWithStakedBalance

  const { onReward } = useAllHarvest(balancesWithValue.map((farmWithBalance) => farmWithBalance.pid))

  const harvestAllFarms = useCallback(async () => {
    setPendingTx(true)
    try {
      await onReward()
    } catch (error) {
      // TODO: find a way to handle when the user rejects transaction or it fails
      console.error(error)
    } finally {
      setPendingTx(false)
    }
  }, [onReward])
  const provider: any = (window as WindowChain).ethereum
  const onAddToken = useCallback(() => {
    if (library) {
      provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: token,
        },
      })
    }
  }, [library, provider, token])

  return (
    <StyledFarmStakingCard>
      <CardImage src={HomeFarm} alt="Home Farm Image" />
      <CardBody p={40}>
        <CardHeading size="xl" mb="24px">
          {TranslateString('Farms', 'Farms')} & {TranslateString('Staking', 'Staking')}
        </CardHeading>
        <Token>
          <img src={hulkLogo} alt="hulk logo" width={74} height={74} />
          <Metamask onClick={onAddToken}>
            <span>+</span>
            <img src={metamaskLogo} alt="metamask logo" width={24} height={24} />
          </Metamask>
        </Token>
        <Button id="buy-all" disabled={false} mb={24}>
          {TranslateString('Buy', 'Buy')} HULk
        </Button>
        <Block>
          <Label>
            HULK {TranslateString('to', 'to')} {TranslateString('Harvest', 'Harvest')}
          </Label>
          <CakeHarvestBalance earningsSum={earningsSum} />
          <Label>~${(hulkPrice * (earningsSum || 0)).toFixed(2)}</Label>
        </Block>
        <Block>
          <Label>HULK {TranslateString('In Wallet', 'In Wallet')}</Label>
          <CakeWalletBalance cakeBalance={hulkBalance} />
          <Label>~${(hulkPrice * hulkBalance).toFixed(2)}</Label>
        </Block>
        <Actions>
          {account ? (
            <Button
              id="harvest-all"
              disabled={balancesWithValue.length <= 0 || pendingTx}
              onClick={harvestAllFarms}
              fullWidth
            >
              {pendingTx
                ? `${TranslateString('Collecting', 'Collecting')}  HULK`
                : TranslateString('Harvest all', `Harvest all (${balancesWithValue.length})`)}
            </Button>
          ) : (
            <UnlockButton fullWidth />
          )}
        </Actions>
      </CardBody>
    </StyledFarmStakingCard>
  )
}

export default FarmedStakingCard
