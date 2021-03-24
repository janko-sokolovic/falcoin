import { Transaction } from '../src/transaction'
import { ec as EC } from 'elliptic'

const ec: EC = new EC('secp256k1')

describe('Test Transaction', () => {
  jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2019-05-14T11:01:58.135Z').valueOf())

  const myKey: EC.KeyPair = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf')
  const myWalletAddress = myKey.getPublic('hex')

  it('creates Transaction correctly', () => {
    const tx = new Transaction(myWalletAddress, 'yourAddress', 10)

    expect(tx.getFromAddress()).toEqual(myWalletAddress)
    expect(tx.getToAddress()).toEqual('yourAddress')
    expect(tx.getAmount()).toEqual(10)
  })

  it('calculates hash correctly', () => {
    const tx = new Transaction(myWalletAddress, 'yourAddress', 10)

    expect(tx.calculateHash()).toEqual('eccc2293fc04b915da4d54897b566b34f47792e578ecac2e083d3e412c864933')
    expect(tx['signature']).toEqual(undefined)
  })

  it('signs Transaction correctly', () => {
    const tx = new Transaction(myWalletAddress, 'yourAddress', 10)

    tx.signTransaction(myKey)

    expect(tx['signature']).not.toEqual(undefined)
  })

  it('signs Transaction incorrectly', () => {
    const tx = new Transaction('WRONG_ADDR', 'yourAddress', 10)

    expect(() => tx.signTransaction(myKey)).toThrow('Cannot sign transactions with other wallets!')
  })

  it('returns true for isValid when from is null (reward transaction)', () => {
    const tx = new Transaction(null, 'yourAddress', 10)

    expect(tx.isValid()).toBe(true)
  })
  it('throws error when isValid is called and signature is not correct', () => {
    const tx = new Transaction(myWalletAddress, 'yourAddress', 10)

    expect(() => tx.isValid()).toThrow('Transaction is not signed!')
  })

  it('signs transaction incorrectly', () => {
    const tx = new Transaction(myWalletAddress, 'yourAddress', 10)

    const illegalKey = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf')
    const illegalWallet = myKey.getPublic('hex')
    const tx2 = new Transaction(illegalWallet, 'yourAddress', 100)
    tx2.signTransaction(illegalKey)

    tx['signature'] = tx2['signature']

    expect(tx.isValid()).toBe(false)
  })
})
