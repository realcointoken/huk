import { Token } from '@hulkfinance/hulk-swap-sdk'
import { SerializedToken } from '../../../config/constants/types'
import { WrappedTokenInfo } from '../../types'

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
    projectLink: '',
    logoURI: token instanceof WrappedTokenInfo ? token.logoURI : undefined,
  }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  if (serializedToken.logoURI) {
    return new WrappedTokenInfo(
      {
        chainId: serializedToken.chainId,
        address: serializedToken.address,
        decimals: serializedToken.decimals,
        symbol: serializedToken.symbol || serializedToken.address,
        name: serializedToken.name || serializedToken.address,
        logoURI: serializedToken.logoURI,
      },
      [],
    )
  }
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  )
}
