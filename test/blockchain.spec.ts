import { Block } from '../src/block'
import { Blockchain } from '../src/blockchain'
import { ec as EC } from 'elliptic'
import { Transaction } from '../src/transaction'

const ec: EC = new EC('secp256k1')

describe('Test Blockchain', () => {
  jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2019-05-14T11:01:58.135Z').valueOf())

  const myKey: EC.KeyPair = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf')
  const myWalletAddress = myKey.getPublic('hex')

  const yourWalletAddress = 'asd'

  let falcoin: Blockchain

  beforeEach(() => {
    falcoin = new Blockchain()
  })

  it('creates blockchain correctly', () => {
    expect(falcoin.getLatestBlock()).toEqual(new Block([], Date.parse('2021-03-24'), '0'))
  })

  it('mines Pending Transactions correctly', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    expect(falcoin['pendingTransactions']).toEqual([])
    expect(falcoin.getBalanceOfAddress(myWalletAddress)).toEqual(100)
    expect(falcoin.getChain().length).toEqual(2)
  })

  it('adds Transaction to pending transactions', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    const tx = new Transaction(myWalletAddress, yourWalletAddress, 10)
    tx.signTransaction(myKey)
    falcoin.addTransaction(tx)

    falcoin.minePendingTransactions(myWalletAddress)
    expect(falcoin.getAllWalletsTransactions(myWalletAddress).length).toEqual(3)
    expect(falcoin.getBalanceOfAddress(myWalletAddress)).toEqual(190)
    expect(falcoin.getChain().length).toEqual(3)
  })

  it('adds illegal transaction no address', () => {
    const tx = new Transaction(null, yourWalletAddress, 10)
    expect(() => falcoin.addTransaction(tx)).toThrow('Missing "from" or "to" addresses')

    const tx2 = new Transaction(myWalletAddress, null, 10)
    expect(() => falcoin.addTransaction(tx)).toThrow('Missing "from" or "to" addresses')
  })

  it('adds illegal transaction not valid', () => {
    const tx = new Transaction(myWalletAddress, yourWalletAddress, 10)
    tx.isValid = () => false

    expect(() => falcoin.addTransaction(tx)).toThrow('Cannot add invalid transaction to the chain')
  })

  it('adds illegal transaction invalid amount', () => {
    const tx = new Transaction(myWalletAddress, yourWalletAddress, -10)
    tx.isValid = () => true

    expect(() => falcoin.addTransaction(tx)).toThrow('Amount must be a positive number higher than 1')

    const tx2 = new Transaction(myWalletAddress, yourWalletAddress, 0)
    tx2.isValid = () => true
    expect(() => falcoin.addTransaction(tx)).toThrow('Amount must be a positive number higher than 1')
  })

  it('adds illegal transaction invalid amount', () => {
    const tx = new Transaction(myWalletAddress, yourWalletAddress, 110)
    tx.isValid = () => true

    expect(() => falcoin.addTransaction(tx)).toThrow('Insufficient funds!')
  })

  it('adds transaction correctly', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    const tx = new Transaction(myWalletAddress, yourWalletAddress, 10)
    tx.isValid = () => true

    falcoin.addTransaction(tx)

    expect(falcoin['pendingTransactions'].length).toEqual(1)
  })

  it('gets balance of address', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    const tx = new Transaction(myWalletAddress, yourWalletAddress, 10)
    tx.isValid = () => true

    falcoin.addTransaction(tx)

    falcoin.minePendingTransactions(myWalletAddress)

    const tx2 = new Transaction(yourWalletAddress, myWalletAddress, 5)
    tx2.isValid = () => true

    falcoin.addTransaction(tx2)

    falcoin.minePendingTransactions(myWalletAddress)

    const balance = falcoin.getBalanceOfAddress(myWalletAddress)

    expect(balance).toEqual(295)
  })

  it('gets all wallets transactions', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    const tx = new Transaction(myWalletAddress, yourWalletAddress, 10)
    tx.isValid = () => true

    falcoin.addTransaction(tx)

    falcoin.minePendingTransactions(myWalletAddress)

    expect(falcoin.getAllWalletsTransactions(myWalletAddress).length).toEqual(3)
  })

  it('checks if chain is valid but genesis block mismatch', () => {
    falcoin.getChain()[0] = new Block([], 0)

    expect(falcoin.isChainValid()).toBe(false)
  })

  it('checks if chain is valid but one block has invalid tx', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    const illegalTx = new Transaction(myWalletAddress, yourWalletAddress, 1)
    illegalTx.isValid = () => false
    falcoin.getChain()[1].getTransactions()[0] = illegalTx

    expect(falcoin.isChainValid()).toBe(false)
  })

  it('checks if chain is valid but one block has invalid hash', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    const tx1 = new Transaction(myWalletAddress, yourWalletAddress, 1)
    tx1.isValid = () => true
    falcoin.addTransaction(tx1)

    falcoin.getLatestBlock()['hash'] = 'illegalHash'

    falcoin.minePendingTransactions(myWalletAddress)

    expect(falcoin.isChainValid()).toBe(false)
  })

  it('checks if chain is valid and returns true for correct chain', () => {
    falcoin.minePendingTransactions(myWalletAddress)

    const tx1 = new Transaction(myWalletAddress, yourWalletAddress, 1)
    tx1.isValid = () => true
    falcoin.addTransaction(tx1)

    falcoin.minePendingTransactions(myWalletAddress)

    expect(falcoin.isChainValid()).toBe(true)
  })
})
