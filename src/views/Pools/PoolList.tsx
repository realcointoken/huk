import React, {useContext} from 'react';
import {useWeb3React} from "@web3-react/core";
import { usePriceHULKBusd } from '../../state/pools/hooks'
import {PoolsContext} from "../../contexts/PoolContext";
import PoolCard from './components/PoolCard/PoolCard';
import FlexLayout from '../../components/layout/Flex';


const getDisplayApr = (cakeRewardsApr: any, lpRewardsApr: any) => {
    if (cakeRewardsApr && lpRewardsApr) {
        return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
    }
    if (cakeRewardsApr) {
        return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
    }
    return null
}
function PoolList() {
    const {account} = useWeb3React()
    const {chosenPoolsMemoized} = useContext(PoolsContext)
    const hulkPrice = usePriceHULKBusd()
    return (
      <FlexLayout>
            {
                chosenPoolsMemoized.map((pool) => {
                    return (
                        <PoolCard
                            key={pool.pid}
                            pool={pool}
                            displayApr={getDisplayApr(pool.apr, pool.lpRewardsApr)}
                            hulkPrice={hulkPrice}
                            account={account}
                            removed={false}
                        />
                    )
                })
            }
      </FlexLayout>
    );
}

export default PoolList;