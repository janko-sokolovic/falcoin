import { Transaction } from './transaction'
import crypto from 'crypto'

class Block {
  private nonce: number
  private hash: string

  constructor(private transactions: Array<Transaction>, private timestamp: number, private previousHash = '') {
    this.nonce = 0
    this.hash = this.calculateHash()
  }

  getHash(): string {
    return this.hash
  }

  getTransactions(): Array<Transaction> {
    return this.transactions
  }
  
  calculateHash(): string {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
      .digest('hex')
  }

  mineBlock(difficulity: number): void {
    while (this.hash.substring(0, difficulity) !== Array(difficulity + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()
    }
  }

  hasValidTransactions(): boolean {
    return this.transactions.every((tx) => tx.isValid())
  }

}

export { Block }
