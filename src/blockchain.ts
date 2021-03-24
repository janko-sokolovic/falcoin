import { Transaction } from './transaction'
import { Block } from './block'

class Blockchain {
  private chain: Array<Block>
  private difficulity: number
  private pendingTransactions: Array<Transaction>
  private minigReward: number

  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulity = 2
    this.pendingTransactions = []
    this.minigReward = 100
  }

  getChain(): Array<Block> {
    return this.chain
  }

  createGenesisBlock(): Block {
    return new Block([], Date.parse('2021-03-24'), '0')
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1]
  }

  minePendingTransactions(rewardAddress: string): void {
    const rewardTx = new Transaction(null, rewardAddress, this.minigReward)
    this.pendingTransactions.push(rewardTx)

    const block = new Block(this.pendingTransactions, Date.now(), this.getLatestBlock().getHash())
    block.mineBlock(this.difficulity)

    this.chain.push(block)

    this.pendingTransactions = []
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.getFromAddress() || !transaction.getToAddress()) throw new Error('Missing "from" or "to" addresses')

    if (!transaction.isValid()) throw new Error('Cannot add invalid transaction to the chain')

    if (transaction.getAmount() <= 0) throw new Error('Amount must be a positive number higher than 1')

    if (this.getBalanceOfAddress(transaction.getFromAddress()) < transaction.getAmount()) throw new Error('Insufficient funds!')

    this.pendingTransactions.push(transaction)
  }

  getBalanceOfAddress(address: string): number {
    return this.chain
      .flatMap(block => block.getTransactions())
      .filter(block => [block.getFromAddress(), block.getToAddress()].includes(address)) // only transactions with our address
      .reduce((balance, curr) => (curr.getFromAddress() === address ? balance - curr.getAmount() : balance + curr.getAmount()), 0)
  }

  getAllWalletsTransactions(address: string): Array<Transaction> {
    return this.chain
      .flatMap(block => block.getTransactions())
      .filter(tx => tx.getFromAddress() === address || tx.getToAddress() === address)
  }

  isChainValid(): boolean {
    const realGenesis = JSON.stringify(this.createGenesisBlock())

    if (realGenesis !== JSON.stringify(this.chain[0])) return false

    return this.chain.every(block => block.hasValidTransactions() && block.getHash() === block.calculateHash())
  }
}

export { Blockchain }
