import { Transaction } from "./transaction"
import { Blockchain } from "./blockchain"
import { ec as EC } from "elliptic"

const ec: EC = new EC("secp256k1")

// Your private key goes here
const myKey: EC.KeyPair = ec.keyFromPrivate("7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf")

// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic("hex")

// Create new instance of Blockchain class
const falcoin = new Blockchain()

// Mine first block
falcoin.minePendingTransactions(myWalletAddress)

// Create a transaction & sign it with your key
const tx1 = new Transaction(myWalletAddress, "address2", 100)
tx1.signTransaction(myKey)
falcoin.addTransaction(tx1)

// Mine block
falcoin.minePendingTransactions(myWalletAddress)

// Create second transaction
const tx2 = new Transaction(myWalletAddress, "address1", 50)
tx2.signTransaction(myKey)
falcoin.addTransaction(tx2)

// Mine block
falcoin.minePendingTransactions(myWalletAddress)

console.log()
console.log(`Balance of jaso is ${falcoin.getBalanceOfAddress(myWalletAddress)}`)
