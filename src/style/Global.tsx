import { createGlobalStyle } from 'styled-components'
// eslint-disable-next-line import/no-unresolved
import { HulkTheme } from '@hulkfinance/hulk-uikit'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends HulkTheme {}
}

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Chivo', sans-serif;
  }
  body {
    background-color: ${({ theme }) => theme.colors.background};

    img {
      height: auto;
      max-width: 100%;
    }
  }
`

export default GlobalStyle
