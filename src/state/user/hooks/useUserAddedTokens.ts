import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { ChainId, Token } from '@hulkfinance/hulk-swap-sdk'
import { AppState } from '../../index'
import { deserializeToken } from './helpers'
import {defaultChainId} from "../../../config";

const selectUserTokens = ({ user: { tokens } }: AppState) => tokens

export const userAddedTokenSelector = createSelector(selectUserTokens, (serializedTokensMap) =>
  Object.values(serializedTokensMap?.[defaultChainId as unknown as ChainId] ?? {}).map(deserializeToken),
)
export default function useUserAddedTokens(): Token[] {
  return useSelector(userAddedTokenSelector)
}
