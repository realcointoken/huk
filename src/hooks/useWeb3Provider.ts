import { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import {simpleRpcProvider} from "../utils/contracts";

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */
const useWeb3Provider = (): ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider => {
    const { library, chainId } = useWeb3React()
    const refEth = useRef(library)
    const [provider, setProvider] = useState(library || simpleRpcProvider)

    useEffect(() => {
        if (library !== refEth.current) {
            setProvider(library || simpleRpcProvider)
            refEth.current = library
        }
    }, [library, chainId])

    return provider
}

export default useWeb3Provider