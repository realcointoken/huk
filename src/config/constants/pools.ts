import { serializeTokens } from './tokens'
import { SerializedPoolConfig } from './types'
import { defaultChainId } from '../index'

const serializedTokens = serializeTokens()

const farms: SerializedPoolConfig[] = [
  /**
   * These 3 farms (PID 0, 2, 3) should always be at the top of the file.
   */
  {
    pid: 0,
    v1pid: 1,
    lpSymbol: 'HULK (15)',
    defaultApr: '91322',
    depositFeeBP: 0,
    lpAddresses: {
      97: '0x4E8c3EF3CF85B99D58929EcF3Acf9665cB71CB82',
      56: '0xc44A5B0E8533a7C4E79D151A28271eB771CDf400',
    },
    token: serializedTokens.hulktoken,
    quoteToken: serializedTokens.hulktoken,
  },

  {
    pid: 1,
    v1pid: 2,
    lpSymbol: 'HULK (30)',
    defaultApr: '101452',
    depositFeeBP: 0,
    lpAddresses: {
      97: '0x4E8c3EF3CF85B99D58929EcF3Acf9665cB71CB82',
      56: '0xc44A5B0E8533a7C4E79D151A28271eB771CDf400',
    },
    token: serializedTokens.hulktoken,
    quoteToken: serializedTokens.hulktoken,
  },
  {
    pid: 2,
    v1pid: 3,
    lpSymbol: 'HULK (45)',
    defaultApr: '125123',
    depositFeeBP: 0,
    lpAddresses: {
      97: '0x4E8c3EF3CF85B99D58929EcF3Acf9665cB71CB82',
      56: '0xc44A5B0E8533a7C4E79D151A28271eB771CDf400',
    },
    token: serializedTokens.hulktoken,
    quoteToken: serializedTokens.hulktoken,
  },
  {
    pid: 3,
    v1pid: 4,
    lpSymbol: 'HULK (60)',
    defaultApr: '166233',
    depositFeeBP: 0,
    lpAddresses: {
      97: '0x4E8c3EF3CF85B99D58929EcF3Acf9665cB71CB82',
      56: '0xc44A5B0E8533a7C4E79D151A28271eB771CDf400',
    },
    token: serializedTokens.hulktoken,
    quoteToken: serializedTokens.hulktoken,
  },
].filter((f) => !!f.lpAddresses[defaultChainId])

export default farms
