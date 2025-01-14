import { CursorBuffer } from '../common/CursorBuffer';

import PathValues from '../constants/PathValues';

import { AccountAddress, AccountState } from '../wallet/Accounts';
import { SignedTransactionWithProof, SignedTransaction } from '../__generated__/transaction_pb';
import { LibraSignedTransactionWithProof, LibraSignedTransaction, LibraTransactionEvent } from '../transaction/Transactions';
import { LCSDeserialization } from '../lcs/deserialization';
import { RawTransactionLCS } from '../lcs/types/RawTransactionLCS';
import { BufferUtil } from '../common/BufferUtil';
import { EventsList } from '../__generated__/events_pb';
import BigNumber from 'bignumber.js';

/**
 * Internal class used by LibraClient
 * to decode pb generated classes to Libra* Classes export by this library
 *
 */
export class ClientDecoder {
  public decodeAccountStateBlob(blob: Uint8Array): AccountState {
    const cursor = new CursorBuffer(blob);
    const blobLen = cursor.read32();

    const state: { [key: string]: Uint8Array } = {};

    for (let i = 0; i < blobLen; i++) {
      const keyLen = cursor.read32();
      const keyBuffer = new Uint8Array(keyLen);
      for (let j = 0; j < keyLen; j++) {
        keyBuffer[j] = cursor.read8();
      }

      const valueLen = cursor.read32();
      const valueBuffer = new Uint8Array(valueLen);
      for (let k = 0; k < valueLen; k++) {
        valueBuffer[k] = cursor.read8();
      }

      state[Buffer.from(keyBuffer).toString('hex')] = valueBuffer;
    }

    return AccountState.fromBytes(state[PathValues.AccountStatePath]);
  }
  
  public decodeSignedTransactionWithProof(
    signedTransactionWP: SignedTransactionWithProof
  ): LibraSignedTransactionWithProof  {
    const signedTransactionProtobuf = signedTransactionWP.getSignedTransaction() as SignedTransaction
    const rawTxnBytes = signedTransactionProtobuf.getSignedTxn_asU8()
    const transactionCursor = new CursorBuffer(rawTxnBytes)
    const transaction = LCSDeserialization.getRawTransaction(transactionCursor)
    const publicKey = LCSDeserialization.getByteArray(transactionCursor)
    const signature = LCSDeserialization.getByteArray(transactionCursor)
    const libraSignedTransaction = new LibraSignedTransaction(transaction, publicKey, signature)
    // decode event
    let eventList: LibraTransactionEvent[] | undefined
    if(signedTransactionWP.hasEvents()) {
      const events = signedTransactionWP.getEvents() as EventsList
      eventList = events.getEventsList().map(event => {
        let key = event.getKey_asU8()
        return new LibraTransactionEvent(event.getEventData_asU8(), new BigNumber(event.getSequenceNumber()), key)
      })
    }
    return new LibraSignedTransactionWithProof(libraSignedTransaction, signedTransactionWP.getProof(), eventList)
  }
}
