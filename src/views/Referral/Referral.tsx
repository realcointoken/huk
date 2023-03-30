/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Heading, Text, BaseLayout, Card, CardBody, Button, Toast, toastTypes } from '@hulkfinance/hulk-uikit'
import { ToastContext } from '../../contexts/ToastContext'
import UnlockButton from '../../components/UnlockButton'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import Page from '../../components/layout/Page'
import useI18n from '../../hooks/useI18n'
import useReferrals from '../../hooks/useReferrals'

const Banner = styled.div`
  width: 100%;
  min-height: 186px;
  background: url('/images/ReferralBanner.png');
  background-repeat: no-repeat;
  background-position: top center;
  background-size: auto 100%;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const BannerHeading = styled(Heading)`
  font-size: 40px;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 48px;
  }
`

const Cards = styled(BaseLayout)`
  align-items: stretch;
  justify-content: stretch;
  margin-bottom: 48px;
  margin-top: 105px;

  & > div {
    grid-column: span 6;
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & > div {
      grid-column: span 8;
    }
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    & > div {
      grid-column: span 6;
    }
  }
`
const BannerText = styled(Text)`
  margin-top: 16px;
  font-size: 16px;
  text-align: center;
  text-transform: capitalize;

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 20px;
  }
`

const TotalReferrals = styled(Card)`
  margin-left: auto;
  margin-right: auto;
`
const CardHeading = styled(Heading)`
  font-size: 20px;
  font-weight: 900;
  text-transform: capitalize;
  padding-bottom: 15px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  @media (min-width: 768px) {
    font-size: 24px;
  }
`
const CardValue = styled(Text)`
  font-size: 16px;
  line-height: 20px;
  text-transform: capitalize;
  @media (min-width: 768px) {
    font-size: 20px;
    line-height: 24px;
  }
`

const CardReferralLink = styled(Card)`
  margin-left: auto;
  margin-right: auto;
  grid-column: span 6;

  // ${({ theme }) => theme.mediaQueries.sm} {
  //   grid-column: span 8;
  // }

  ${({ theme }) => theme.mediaQueries.lg} {
    grid-column: span 12 !important;
  }
`

const ReferralHeading = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};

  h2 {
    border-bottom: none;
    padding-bottom: 0;
    margin-right: 16px;
  }
`

const ReferralLink = styled(Text)`
  text-align: center;
  margin-top: 20px;
  font-size: 20px;
  width: 100%;
  word-break: break-all;
  padding-bottom: 0;
`
const ReferralLinkInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-100%, -100%);
  z-index: -10;
`

const Referral: React.FC = () => {
  const TranslateString = useI18n()
  const { totalReferrals, totalFees } = useReferrals()
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false)
  const { account } = useActiveWeb3React()
  const { addToast } = useContext(ToastContext)
  const [referralLinkValue, setReferralLinkValue] = useState<string>('')
  useEffect(() => {
    let timeOut: any = null
    if (isCopiedLink) {
      timeOut = setTimeout(() => {
        setIsCopiedLink(false)
      }, 3000)
    }
    return () => {
      if (timeOut) {
        clearTimeout(timeOut)
      }
    }
  }, [isCopiedLink])
  const referralLink = useRef<HTMLInputElement>(null)

  const copyToClipboard = useCallback(() => {
    const now = Date.now()
    const toast: Toast = {
      id: `id-${now}`,
      title: TranslateString('Copy link', 'Copy link'),
      description: TranslateString(
        'Referral link has been copied to clipboard',
        'Referral link has been copied to clipboard',
      ),
      type: toastTypes.INFO,
    }
    if (referralLink) {
      const element = referralLink.current
      if (element) {
        if (navigator.clipboard) {
          const inputValue = element.value
          if (inputValue) {
            navigator.clipboard
              .writeText(inputValue)
              .then(() => {
                setIsCopiedLink(true)
                addToast(toast)
              })
              .catch((e) => {
                console.info(e.message || e)
              })
          }
        } else {
          element.select()
          document.execCommand('copy')
          setIsCopiedLink(true)
          addToast(toast)
        }
      }
    }
  }, [addToast, referralLink])

  useEffect(() => {
    if (window !== undefined) {
      setReferralLinkValue(`${window.location.origin}?ref=${account}`)
    } else {
      setReferralLinkValue('')
    }
  }, [account])
  return (
    <>
      <ReferralLinkInput
        type="text"
        ref={referralLink}
        onChange={(event) => setReferralLinkValue(event.target.value)}
        value={referralLinkValue}
        readOnly
      />
      <Banner>
        <BannerHeading as="h1" mb="0" color="secondary">
          HULK {TranslateString('Referral Program', 'Referral Program')}
        </BannerHeading>
        <BannerText color="primary">
          {TranslateString(
            'Share the referral link below to invite your friends and earn 3% of your friends earnings FOREVER!',
            'Share the referral link below to invite your friends and earn 3% of your friends earnings FOREVER!',
          )}
        </BannerText>
      </Banner>
      <Page>
        <div>
          <Cards>
            <TotalReferrals>
              <CardBody p={40}>
                <CardHeading mb="24px">{TranslateString('Referral Program', 'Referral Program')}</CardHeading>
                <CardValue>{totalReferrals}</CardValue>
              </CardBody>
            </TotalReferrals>
            <TotalReferrals>
              <CardBody p={40}>
                <CardHeading mb="24px">
                  {TranslateString('Total Referrals Fees Commissions', 'Total Referrals Fees Commissions')}
                </CardHeading>
                <CardValue>{totalFees.toFixed(3)} HULK</CardValue>
              </CardBody>
            </TotalReferrals>
            <CardReferralLink>
              <CardBody p={40}>
                <ReferralHeading>
                  <CardHeading>{TranslateString('Your Referral Link', 'Your Referral Link')}</CardHeading>
                  {account && (
                    <Button onClick={copyToClipboard} variant="secondary" size="sm">
                      {isCopiedLink ? TranslateString('Copied', 'Copied') : TranslateString('Copy', 'Copy')}
                    </Button>
                  )}
                </ReferralHeading>
                {account ? <ReferralLink color="primary">{referralLinkValue}</ReferralLink> : <UnlockButton />}
              </CardBody>
            </CardReferralLink>
          </Cards>
        </div>
      </Page>
    </>
  )
}

export default Referral
