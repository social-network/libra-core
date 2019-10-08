import BigNumber from 'bignumber.js';
import LibraClient from '../client';
import Addresses from '../constants/Addresses';
import ProgamBase64Codes from '../constants/ProgamBase64Codes';
import { AccountAddress } from '../wallet/Accounts';
import { LibraVMStatusError } from './Errors';
import { ProgramLCS } from '../lcs/types/ProgramLCS';
import { TransactionArgumentLCS } from '../lcs/types/TransactionArgumentLCS';
import { AddressLCS } from '../lcs/types/AddressLCS';
import { RawTransactionLCS } from '../lcs/types/RawTransactionLCS';
import { TransactionPayloadLCS } from '../lcs/types/TransactionPayloadLCS';
import {Account} from '../wallet/Accounts'
import { LCSSerialization } from '../lcs/serialization';
import {BufferUtil} from '../common/BufferUtil';


export interface LibraGasConstraint {
  maxGasAmount: BigNumber;
  gasUnitPrice: BigNumber;
}

export class LibraTransaction {


  static createTransfer(sender: Account, recipientAddress: string, numAccount: BigNumber, sequence: BigNumber): RawTransactionLCS {
    // construct program
    let prog = new ProgramLCS()
    //prog.setCodeFromBuffer(Buffer.from(ProgamBase64Codes.peerToPeerTxn,'base64'))
    prog.setCodeFromBuffer(BufferUtil.fromBase64(ProgamBase64Codes.peerToPeerTxn))
    const recipientAddressLCS = new AddressLCS(recipientAddress)
    prog.addTransactionArg(TransactionArgumentLCS.fromAddress(recipientAddressLCS))
    prog.addTransactionArg(TransactionArgumentLCS.fromU64(numAccount.toString()))
    // construct payload
    let payload = TransactionPayloadLCS.fromProgram(prog)
    // raw transaction
    let transaction = new RawTransactionLCS(sender.getAddress().toHex(), sequence.toString(), payload)
    return transaction
  }
}

export class LibraTransactionResponse {
  public readonly signedTransaction: LibraSignedTransaction;
  public readonly validatorId: Uint8Array;
  public readonly acStatus?: LibraAdmissionControlStatus;
  public readonly mempoolStatus?: LibraMempoolTransactionStatus;
  public readonly vmStatus?: LibraVMStatusError;

  constructor(
    signedTransaction: LibraSignedTransaction,
    validatorId: Uint8Array,
    acStatus?: LibraAdmissionControlStatus | number,
    mempoolStatus?: LibraMempoolTransactionStatus | number,
    vmStatus?: LibraVMStatusError,
  ) {
    this.signedTransaction = signedTransaction;
    this.validatorId = validatorId;
    this.acStatus = acStatus;
    this.mempoolStatus = mempoolStatus;
    this.vmStatus = vmStatus;
  }

  /*
  public async awaitConfirmation(client: LibraClient): Promise<void> {
    return client.waitForConfirmation(
      this.signedTransaction.transaction.sendersAddress,
      this.signedTransaction.transaction.sequenceNumber.plus(1),
    );
  }
  */
}

export enum LibraAdmissionControlStatus {
  ACCEPTED = 0,
  BLACKLISTED = 1,
  REJECTED = 2,
  UNKNOWN = -1,
}

export enum LibraMempoolTransactionStatus {
  VALID = 0,
  INSUFFICIENTBALANCE = 1,
  INVALIDSEQNUMBER = 2,
  MEMPOOLISFULL = 3,
  TOOMANYTRANSACTIONS = 4,
  INVALIDUPDATE = 5,
  UNKNOWN = -1,
}
export class LibraSignedTransaction {
  public readonly transaction: RawTransactionLCS;
  public readonly publicKey: Uint8Array;
  public readonly signature: Uint8Array;

  constructor(transaction: RawTransactionLCS, publicKey: Uint8Array, signature: Uint8Array) {
    this.transaction = transaction;
    this.publicKey = publicKey;
    this.signature = signature;
  }
}

export class LibraSignedTransactionWithProof {
  public readonly signedTransaction: LibraSignedTransaction;
  public readonly proof?: LibraSignedTransactionProof;
  public readonly events?: LibraTransactionEvent[];

  constructor(signedTransaction: LibraSignedTransaction, proof?: object, events?: LibraTransactionEvent[]) {
    this.signedTransaction = signedTransaction;
    this.proof = proof;
    this.events = events;
  }
}

// TODO: Implement abstraction over the pb classes for transaction proof
class LibraSignedTransactionProof {}

export class LibraTransactionEvent {
  public readonly data: Uint8Array; // eventData
  public readonly sequenceNumber: BigNumber;
  public readonly eventKey?: Uint8Array;

  constructor(data: Uint8Array, sequenceNumber: BigNumber | string, eventKey?: Uint8Array) {
    this.data = data;
    this.sequenceNumber = new BigNumber(sequenceNumber);
    this.eventKey = eventKey;
  }
}
