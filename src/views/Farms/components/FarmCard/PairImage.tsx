import React from 'react'
import styled from 'styled-components'

const PairImageStyled = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
`
const Image = styled.img`
  width: 52px;
  height: 52px;
  position: absolute;
  top: 0;
  left: 0;
  &:last-child {
    width: 40px;
    height: 40px;
    top: unset;
    left: unset;
    bottom: 0;
    right: 7px;
  }
`
function PairImage({ token0, token1 }: {token0: string, token1: string}) {
  const token0Image = token0 !== '' ? `/images/tokens/${token0.toLowerCase()}.png` : null
  const token1Image = token0 !== '' ? `/images/tokens/${token1.toLowerCase()}.png` : null
  return (
    <PairImageStyled>
      {token0Image && <Image src={token0Image} alt={token0}/>}
      {token1Image && <Image src={token1Image} alt={token1}/>}
    </PairImageStyled>
  )
}

export default PairImage