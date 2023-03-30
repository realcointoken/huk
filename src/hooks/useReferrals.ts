import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { fromWei, toWei } from 'web3-utils'
import useActiveWeb3React from './useActiveWeb3React'
import useBlockNumber from './useBlockNumber'
import { getHULKReferralContract } from '../utils/contractHelpers'
import { getProviderOrSigner } from '../utils'

const useReferrals = () => {
  const blockNumber = useBlockNumber()
  const [totalReferrals, setTotalReferrals] = useState<BigNumber>(new BigNumber(0))
  const { account, library } = useActiveWeb3React()
  const [totalFees, setTotalFees] = useState<BigNumber>(new BigNumber(0))

  const fetchReferrals = useCallback(async () => {
    if (account && library) {
      const hulkContract = getHULKReferralContract()
      const referrals = await hulkContract.referralsCount(account)
      const fees = await hulkContract.totalReferralCommissions(account)
      setTotalReferrals(referrals)
      setTotalFees(fees)
    }
  }, [account, library])

  useEffect(() => {
    fetchReferrals()
  }, [blockNumber, fetchReferrals])

  return { totalReferrals: totalReferrals.toNumber(), totalFees: +fromWei(totalFees.toString()) }
}

export default useReferrals
