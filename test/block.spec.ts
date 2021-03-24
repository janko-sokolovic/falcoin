import { Block } from '../src/block'
import { Transaction } from '../src/transaction'

describe('Test Block', () => {
  it('calculates hash correctly', () => {
    const block = new Block([], 1, 'abc')

    expect(block.calculateHash()).toBe('e506b0a326f029d77d10294ae66be3cf212aee0f932c698b4b264ba48ed4e3fd')
  })

  it('mines block correctly', () => {
    const transactions = [new Transaction(null, 'to', 123)]

    const block = new Block(transactions, 0)
    block.mineBlock(3)

    expect(block.getHash().substring(0, 3)).toEqual('000')
  })

  it('creates Block with correct values', () => {
    const transactions = [new Transaction(null, 'to', 123)]

    const block = new Block(transactions, 0)

    expect(block.hasValidTransactions()).toBe(true)
  })

  it('checks that block has invalid transaction', () => {
    const invalidTransaction = new Transaction('WRONG', 'YES WRONG', -123)
    invalidTransaction.isValid = () => false

    const transactions = [new Transaction(null, 'to', 123), invalidTransaction]

    const block = new Block(transactions, 0)

    expect(block.hasValidTransactions()).toBe(false)
  })
})
