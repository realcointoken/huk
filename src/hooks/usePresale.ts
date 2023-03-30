/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import { fromWei, toWei } from 'web3-utils'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from 'ethers'
import useActiveWeb3React from './useActiveWeb3React'
import { useERC20, useHulkPreContract } from './useContract'
import { escapeRegExp, getBscScanLink, inputRegex, shortBalance } from '../utils'
import { ToastContext } from '../contexts/ToastContext'
import useBlockNumber from './useBlockNumber'
import { getHULKPreAddress, getHULKSwapAddress } from '../utils/addressHelpers'
import { defaultChainId } from '../config'
import useI18n from './useI18n'

export enum ERound {
  RoundZero = 0,
  RoundOne = 1,
  RoundTwo = 2,
}

export const ERoundAvailable = {
  0: '210000000000000000000000000',
  1: '210000000000000000000000000',
  2: '210000000000000000000000000',
}

export enum ECoins {
  Zero = '0x0000000000000000000000000000000000000000',
  BUSD = '0xdB1Cc97ada0D2A0bCE7325699A9F1081C95F0ac9',
  USDT = '0xbDf2f04a77Ca7474F127208cab24260197D14a04',
}

export function useGetCurrentRound() {
  const hulkPreContract: any = useHulkPreContract()
  const [round, setRound] = useState<ERound>(ERound.RoundZero)
  const block = useBlockNumber()

  const getData = useCallback(() => {
    if (hulkPreContract) {
      hulkPreContract
        .getCurrentRound()
        .then((res: any) => {
          setRound(parseInt(res))
        })
        .catch((e: any) => {
          console.log(e)
        })
    }
  }, [hulkPreContract])

  useEffect(() => {
    getData()
  }, [getData, block])
  return round
}

export default function usePresale() {
  const BN_0 = BigNumber.from('0')
  const { addToast } = useContext(ToastContext)
  const { account, library } = useActiveWeb3React()
  const busdToken = useERC20(ECoins.BUSD)
  const usdtToken = useERC20(ECoins.USDT)
  const hulkPreContract: any = useHulkPreContract()
  const round = useGetCurrentRound()
  const [availableTokens, setAvailableTokens] = useState<BigNumber>(BN_0)
  const [coin, setCoin] = useState<ECoins | string>(ECoins.Zero)
  const [balance, setBalance] = useState<BigNumber>(BN_0)
  const [allowance, setAllowance] = useState<{ busd: BigNumber; usdt: BigNumber }>({ busd: BN_0, usdt: BN_0 })
  const block = useBlockNumber()
  const [pending, setPending] = useState<boolean>(false)
  const [pendingApprove, setPendingApprove] = useState<boolean>(false)
  const [rate, setRate] = useState<BigNumber>(BN_0)
  const [amountIn, setAmountIn] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')
  const [coinToTokens, setCoinToTokens] = useState<BigNumber>(BN_0)
  const [tokenToCoins, setTokenToCoins] = useState<BigNumber>(BN_0)
  const [percent, setPercent] = useState<number>(0)
  const [price, setPrice] = useState<BigNumber>(BN_0)
  const TranslateString = useI18n()

  useEffect(() => {
    if (account && library && coin === ECoins.Zero) {
      library
        .getBalance(account)
        .then((res: any) => {
          setBalance(BigNumber.from(res))
        })
        .catch((e: any) => {
          console.log(e)
        })
    }
  }, [coin, account, library])

  const getData = useCallback(() => {
    if (hulkPreContract) {
      hulkPreContract
        .getPrice()
        .then((res: any) => {
          setPrice(BigNumber.from(res))
        })
        .catch((e: any) => {
          console.log(e)
        })
      hulkPreContract
        .getAvailable()
        .then((res: any) => {
          setAvailableTokens(BigNumber.from(res))
        })
        .catch((e: any) => {
          console.log(e)
        })
    }
  }, [hulkPreContract])

  useEffect(() => {
    getData()
  }, [getData, block])

  const getDataCoins = useCallback(() => {
    if (coin !== ECoins.Zero && account) {
      const tokenContract = coin === ECoins.BUSD ? busdToken : usdtToken
      if (tokenContract) {
        tokenContract
          .balanceOf(account)
          .then((res: any) => {
            setBalance(BigNumber.from(res))
          })
          .catch((e: any) => {
            console.log(e)
          })
        tokenContract
          .allowance(account, getHULKPreAddress())
          .then((res: any) => {
            setAllowance((prevState) => {
              return {
                ...prevState,
                [coin === ECoins.BUSD ? 'busd' : 'usdt']: BigNumber.from(res),
              }
            })
          })
          .catch((e: any) => {
            console.log(e)
          })
      }
    }
  }, [coin, busdToken, usdtToken, account])

  useEffect(() => {
    getDataCoins()
  }, [block, getDataCoins])
  // 1_000_069_780_000
  useEffect(() => {
    if (hulkPreContract) {
      hulkPreContract
        .getRate(coin)
        .then((res: string) => {
          setRate(BigNumber.from(res))
        })
        .catch((e: any) => {
          console.log(e)
        })
    }
  }, [amountIn, coin, hulkPreContract])

  const onChangeAmountIn = useCallback(
    async (value: string) => {
      let nextUserInput = value.replace(/,/g, '.')
      const maxBalance = fromWei(balance.toString())
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        nextUserInput = parseFloat(nextUserInput) > parseFloat(maxBalance) ? maxBalance.toString() : nextUserInput
        setAmountIn(shortBalance(nextUserInput, 8))
        if (hulkPreContract && nextUserInput !== '') {
          try {
            const tokens: string = await hulkPreContract.coinToTokens(toWei(nextUserInput), coin)
            setCoinToTokens(BigNumber.from(tokens))
            setAmountOut(fromWei(tokens))
          } catch {
            setCoinToTokens(BN_0)
            setAmountOut('')
          }
        } else {
          setCoinToTokens(BN_0)
          setAmountOut('')
        }
      } else {
        setCoinToTokens(BN_0)
        setAmountOut('')
      }
    },
    [balance, hulkPreContract, coin, BN_0],
  )

  const onChangeAmountOut = useCallback(
    async (value: string) => {
      const nextUserInput = value.replace(/,/g, '.')
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        setAmountOut(shortBalance(nextUserInput, 8))
        if (hulkPreContract && nextUserInput !== '') {
          try {
            const coins: string = await hulkPreContract.tokensToCoin(toWei(nextUserInput), coin)
            setTokenToCoins(BigNumber.from(coins))
            setAmountIn(fromWei(coins))
          } catch {
            setTokenToCoins(BN_0)
            setAmountIn('')
          }
        } else {
          setTokenToCoins(BN_0)
          setAmountIn('')
        }
      } else {
        setTokenToCoins(BN_0)
        setAmountIn('')
      }
    },
    [BN_0, coin, hulkPreContract],
  )

  const onBuyTokens = useCallback(async () => {
    if (hulkPreContract) {
      const now = Date.now()
      const toast: Toast = {
        id: `id-${now}`,
        title: TranslateString('Success!', 'Success!'),
        description: `${TranslateString('Bought', 'Bought')} ${fromWei(amountOut.toString())} HULKPre!`,
        type: toastTypes.SUCCESS,
      }
      setPending(true)
      const valueBnb = toWei(amountIn.toString())
      const value = coinToTokens.toString()
      const params: { from: any; value?: string } = { from: account }
      if (coin === ECoins.Zero) params.value = valueBnb
      const trx = await hulkPreContract
        .buyTokens(value, coin, { ...params })
        .catch((e: any) => {
          toast.title = TranslateString('Failed', 'Failed')
          toast.type = toastTypes.DANGER
          toast.description =
            e.receipt !== undefined ? TranslateString('Oops, something wrong.', 'Oops, something wrong.') : e.message
        })
        .finally(() => {
          setPending(false)
          getData()
        })
      if (trx?.hash) {
        toast.action = {
          text: TranslateString('View on BscScan', 'View on BscScan'),
          url: `https://testnet.bscscan.com/tx/${trx.hash}`,
        }
      }
      addToast(toast)
    }
  }, [hulkPreContract, amountOut, amountIn, coinToTokens, account, coin, addToast, getData])

  useEffect(() => {
    if (!availableTokens.isZero()) {
      const availableDefault = parseFloat(fromWei(ERoundAvailable[round]))
      const availableCurrent = parseFloat(fromWei(availableTokens.toString()))
      const perc: number = 100 - (availableCurrent / availableDefault) * 100
      setPercent(parseFloat(perc.toFixed(3)))
    } else {
      setPercent(100)
    }
  }, [round, availableTokens])

  const onMax = useCallback(() => {
    const maxBalance = shortBalance(fromWei(balance.toString()))
    setAmountIn(maxBalance)
  }, [setAmountIn, balance])

  const onSelectCoin = useCallback((selectCoin: ECoins | string) => {
    setCoin(selectCoin)
  }, [])

  const approve = useCallback(
    async (tokenContract: Contract | null) => {
      if (account) {
        const now = Date.now()
        const toast: Toast = {
          id: `id-${now}`,
          title: TranslateString('Success!', 'Success!'),
          description: TranslateString('Transaction Confirmed', 'Transaction Confirmed'),
          type: toastTypes.SUCCESS,
        }
        setPendingApprove(true)
        if (tokenContract && account) {
          tokenContract
            .approve(getHULKPreAddress(), MaxUint256, { from: account })
            .then((res: TransactionResponse) => {
              if (res?.hash) {
                toast.action = {
                  text: TranslateString('View on BscScan', 'View on BscScan'),
                  url: getBscScanLink(res.hash, TranslateString('transaction', 'transaction'), defaultChainId),
                }
              }
              addToast(toast)
            })
            .catch((error: any) => {
              toast.title = TranslateString('Failed', 'Failed')
              toast.type = toastTypes.DANGER
              toast.description =
                error.data?.message ||
                error.message ||
                TranslateString('Oops, something wrong.', 'Oops, something wrong.')
              addToast(toast)
            })
            .finally(() => setPendingApprove(false))
        }
        setPendingApprove(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [account, addToast],
  )

  const onApprove = useCallback(async () => {
    if (coin !== ECoins.Zero && account) {
      const isBusd = coin === ECoins.BUSD
      if (isBusd) {
        await approve(busdToken)
      } else {
        await approve(usdtToken)
      }
      getDataCoins()
    }
  }, [coin, account, getDataCoins, approve, busdToken, usdtToken])

  return useMemo(() => {
    return {
      round,
      availableTokens,
      onBuyTokens,
      pending,
      onChangeAmountIn,
      balance,
      amountIn,
      onMax,
      coin,
      onSelectCoin,
      allowance,
      onApprove,
      pendingApprove,
      percent,
      tokenToCoins,
      amountOut,
      onChangeAmountOut,
    }
  }, [
    round,
    availableTokens,
    onBuyTokens,
    pending,
    onChangeAmountIn,
    balance,
    amountIn,
    onMax,
    coin,
    onSelectCoin,
    allowance,
    onApprove,
    pendingApprove,
    percent,
    tokenToCoins,
    amountOut,
    onChangeAmountOut,
  ])
}
