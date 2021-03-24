import crypto from 'crypto'
import { ec as EC } from 'elliptic'

const ec: EC = new EC('secp256k1')

class Transaction {
  private timestamp: number
  private signature: string | undefined

  constructor(private from: string, private to: string, private amount: number) {
    this.timestamp = Date.now()
  }

  getFromAddress(): string {
    return this.from
  }

  getToAddress(): string {
    return this.to
  }

  getAmount(): number {
    return this.amount
  }

  calculateHash(): string {
    return crypto
      .createHash('sha256')
      .update(this.from + this.to + this.amount + this.timestamp)
      .digest('hex')
  }

  signTransaction(signingKey: EC.KeyPair): void {
    if (signingKey.getPublic('hex') !== this.from) throw new Error('Cannot sign transactions with other wallets!')

    const hashTx = this.calculateHash()
    const sig = signingKey.sign(hashTx, 'base64')

    this.signature = sig.toDER('hex')
  }

  isValid(): boolean {
    if (this.from === null) return true

    if (!this.signature || this.signature.length === 0) throw new Error('Transaction is not signed!')

    const publicKey = ec.keyFromPublic(this.from, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}

export { Transaction }
