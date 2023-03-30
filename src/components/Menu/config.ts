import { MenuEntry } from '@hulkfinance/hulk-uikit'
import useI18n from '../../hooks/useI18n'

const config: MenuEntry[] = [
  {
    label: 'Home',
    icon: 'HomeIcon',
    href: '/',
  },
  {
    label: 'Trade',
    icon: 'TradeIcon',
    items: [
      {
        label: 'Exchange',
        href: 'https://pancakeswap.finance/swap',
      },
      {
        label: 'Liquidity',
        href: 'https://pancakeswap.finance/liquidity',
      },
    ],
  },
  // {
  //   label: "Pre-Sale",
  //   icon: "PreSaleIcon",
  //   href: "/pre-sale",
  // },
  {
    label: 'Farms',
    icon: 'FarmIcon',
    href: '/farms',
  },
  {
    label: 'Pools',
    icon: 'PoolIcon',
    href: '/pools',
  },
  {
    label: 'Referrals',
    icon: 'ReferralIcon',
    href: '/referral',
  },
  // {
  //   label: "Audits",
  //   icon: "AuditIcon",
  //   href: "/audits",
  // },
  {
    label: 'Listings',
    icon: 'ListingIcon',
    items: [
      {
        label: 'BscScan',
        href: '/',
      },
      {
        label: 'DappRadar',
        href: '/',
      },
      {
        label: 'CoinGecko',
        href: '/',
      },
      {
        label: 'CoinMarketCap',
        href: '/',
      },
      {
        label: 'LiveCoinWatch',
        href: '/',
      },
      {
        label: 'Vfat',
        href: '/',
      },
    ],
  },
  {
    label: 'More',
    icon: 'MoreIcon',
    items: [
      // {
      //   label: "Voting",
      //   href: "https://voting.hulkfiinance.com",
      // },
      {
        label: 'Github',
        href: 'https://github.com/hulkfinance',
      },
      {
        label: 'Docs',
        href: 'https://financehulk.gitbook.io/hulkfinance/',
      },
      {
        label: 'Blog',
        href: 'https://medium.com/@hulk-finance',
      },
    ],
  },
]

export default config
