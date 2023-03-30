/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, useCallback, useEffect, useContext } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Button, Flex, Text, Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import { parseUnits } from '@ethersproject/units'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'
import { FarmWithStakedValue } from '../../../../state/types'
import useI18n from '../../../../hooks/useI18n'
import { useFarmFromPid, useFarmUser } from '../../../../state/farms/hooks'
import UnlockButton from '../../../../components/UnlockButton'
import { useERC20, useLPContract } from '../../../../hooks/useContract'
import useApproveFarm from '../../../../hooks/Farms/useApproveFarm'
import getLiquidityUrlPathParts from '../../../../utils/getLiquidityUrlPathParts'
import { BIG_ZERO } from '../../../../utils/bigNumber'
import { BASE_ADD_LIQUIDITY_URL, defaultChainId } from '../../../../config'
import { formatBigNumber, getBalanceAmount, getFullDisplayBalance } from '../../../../utils/formatBalance'
import { useAppDispatch } from '../../../../state'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { getAddress, getHULKTokenAddress } from '../../../../utils/addressHelpers'
import { getBscScanLink } from '../../../../utils'
import { ToastContext } from '../../../../contexts/ToastContext'
import { fetchFarmUserDataAsync } from '../../../../state/farms'
import { usePoolLength } from '../../../../hooks/useMasterChef'

const Action = styled.div`
  margin-top: 8px;
`

const FarmText = styled(Text)`
  font-weight: 400;
  text-transform: uppercase;
  font-size: 20px;
  line-height: 1.2;
`

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  account?: string | null
}

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, account }) => {
  const TranslateString = useI18n()
  const { pid } = farm
  const lpLabel = farm.lpSymbol
  const earnLabel = farm.dual ? farm.dual.earnLabel : 'HULK'
  const { addToast } = useContext(ToastContext)
  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: farm.quoteToken.address,
    tokenAddress: farm.token.address,
  })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
  const lpAddress = getAddress(farm.lpAddresses)
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { allowance } = farm.userData || {}
  // const [tokens, setTokens] = useState<{ token0: string; token1: string }>({ token0: '', token1: '' })
  const isApproved = useMemo(() => {
    return account && allowance && allowance.isGreaterThan(0)
  }, [account, allowance])
  const dispatch = useAppDispatch()

  // pid === 4 ? console.log(farm.userData?.allowance.toString()) : ''

  const lpContract = useLPContract(lpAddress)

  const length = usePoolLength()

  // useEffect(() => {
  //   if (lpContract && lpAddress !== getHULKTokenAddress()) {
  //     lpContract.token0().then((res: string) => {
  //       setTokens((prevState) => {
  //         return {
  //           ...prevState,
  //           token0: res,
  //         }
  //       })
  //     })
  //     lpContract.token1().then((res: string) => {
  //       setTokens((prevState) => {
  //         return {
  //           ...prevState,
  //           token1: res,
  //         }
  //       })
  //     })
  //   } else if (lpAddress !== getHULKTokenAddress()) {
  //     setTokens({ token0: getHULKTokenAddress(), token1: getHULKTokenAddress() })
  //   }
  // }, [lpAddress, lpContract])
  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    if (!onApprove) return
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove()
    })
    if (receipt?.status) {
      const toast: Toast = {
        id: `id-${Date.now()}`,
        title: TranslateString('Contract Enabled', 'Contract Enabled'),
        description: TranslateString('Contract Enabled', 'Contract Enabled'),
        type: toastTypes.SUCCESS,
      }
      toast.action = {
        text: TranslateString('View on BscScan', 'View on BscScan'),
        url: getBscScanLink(receipt.transactionHash, 'transaction', defaultChainId),
      }
      addToast(toast)
      // @ts-ignore
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }, [onApprove, fetchWithCatchTxError, addToast, dispatch, account, pid])
  const farmUser = useFarmUser(pid)
  const { stakedBalance, earnings, tokenBalance } = useMemo(() => {
    if (farmUser) {
      return { stakedBalance: farmUser.stakedBalance, earnings: farmUser.earnings, tokenBalance: farmUser.tokenBalance }
    }
    return { stakedBalance: BIG_ZERO, earnings: BIG_ZERO, tokenBalance: BIG_ZERO }
  }, [farmUser])

  // console.log(farm, farmUser, earnings.toNumber())
  return (
    <Action>
      <Flex>
        <FarmText color="secondary" pr="3px">
          {earnLabel}
        </FarmText>
        <FarmText color="primary">{TranslateString('Earned', 'Earned')}</FarmText>
      </Flex>
      <HarvestAction farm={farm} earnings={earnings} pid={farm.pid} />
      <Flex>
        <FarmText color="secondary" pr="3px">
          {lpLabel}
        </FarmText>
        <FarmText color="textSubtle">{TranslateString('Staked', 'Staked')}</FarmText>
      </Flex>
      {
        // eslint-disable-next-line no-nested-ternary
        !account ? (
          <UnlockButton mt="16px" fullWidth />
        ) : length?.gt(pid) ? (
          !isApproved ? (
            <Button mt="16px" fullWidth disabled={pendingTx} onClick={handleApprove}>
              {TranslateString('Approve Contract', 'Approve Contract')}
            </Button>
          ) : (
            <StakeAction
              farm={farm}
              stakedBalance={stakedBalance}
              tokenBalance={tokenBalance}
              tokenName={lpLabel}
              pid={pid}
              depositFeeBP={farm.depositFeeBP}
            />
          )
        ) : (
          <Button mt="16px" fullWidth>
            {TranslateString('Coming Soon', 'Coming Soon')}
          </Button>
        )
      }
    </Action>
  )
}

export default CardActions
