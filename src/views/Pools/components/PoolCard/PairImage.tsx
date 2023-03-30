import React from 'react'
import styled from 'styled-components'

const PairImageStyled = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
`
const Image = styled.img`
  width: 60px;
  height: 60px;
  position: absolute;
  top: 0;
  left: 0;
`

const NumberPool = styled.div`
  width: 23px;
  height: 23px;
  background-color: #fff;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 2px;
  bottom: 1px;
`
function PairImage({ token0, token1 }: {token0: string, token1: string}) {
  const token0Image = token0 !== '' ? `/images/tokens/${token0.toLowerCase()}.png` : null
  return (
    <PairImageStyled>
      {token0Image && <Image src={token0Image} alt={token0}/>}
      <NumberPool>{token1}</NumberPool>
    </PairImageStyled>
  )
}

export default PairImage