import { useCallback, useEffect, useMemo, useState } from 'react'
import { storageReferralKey } from '../config/constants'
import useBlockNumber from './useBlockNumber'

export default function useReferral() {
  const [affiliateAddress, setAffiliateAddress] = useState<string>('0x0000000000000000000000000000000000000000')
  const blockNumber = useBlockNumber()

  useEffect(() => {
    const checkedAddress = localStorage.getItem(storageReferralKey)
    if (checkedAddress !== null) {
      setAffiliateAddress(checkedAddress)
    }
  }, [blockNumber])

  const onSaveAffiliateAddress = useCallback(
    (address) => {
      // console.log(affiliateAddress)
      if (affiliateAddress === '0x0000000000000000000000000000000000000000') {
        setAffiliateAddress(address)
        localStorage.setItem(storageReferralKey, address)
      }
    },
    [affiliateAddress],
  )

  return useMemo(() => {
    return { onSaveAffiliateAddress, affiliateAddress }
  }, [onSaveAffiliateAddress, affiliateAddress])
}
