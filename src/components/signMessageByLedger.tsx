import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
function uint8ArrayToHexString(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function SignMessageByLedger() {
  const {connection} = useConnection();
  const {publicKey,signTransaction} = useWallet();


  const  onClick = async () => {
    if (!publicKey || !signTransaction) {
      return;
    }
    const originalMessage = "4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15";
    // 将消息转换为 Uint8Array
    const messageBytes = new TextEncoder().encode(originalMessage);

    // 创建一个 transaction
    const transaction = new Transaction();

    // 添加 ComputeBudget 的 setComputeUnitLimit 指令 (值设为0)
    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
        data: new Uint8Array([3, 0, 0, 0, 0, 0, 0, 0, 0])  // 第一个字节是指令类型(3)，后面8字节是值(0)
      })
    );

    // 添加 ComputeBudget 的 setComputeUnitPrice 指令 (值设为0)
    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
        data: new Uint8Array([2, 0, 0, 0, 0])  // 第一个字节是指令类型(2)，后面4字节是值(0)
      })
    );

    // 添加 Memo 指令
    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: messageBytes,
      })
    );

    // 设置交易的参数
    transaction.feePayer = publicKey;

    // 创建一个全0的32字节 blockhash
    const zeroHash = new Uint8Array(32).fill(0);
    transaction.recentBlockhash = new PublicKey(zeroHash).toString();

    // 打印交易的详细结构
    console.log("Transaction structure before signing:");
    console.log("Number of instructions:", transaction.instructions.length);
    transaction.instructions.forEach((instruction, index) => {
      console.log(`Instruction ${index}:`, {
        programId: instruction.programId.toBase58(),
        keys: instruction.keys,
        data: uint8ArrayToHexString(instruction.data)
      });
    });

    // 打印序列化的交易数据
    const serializedTx = transaction.serialize({requireAllSignatures: false}).toString('hex');
    console.log("Serialized transaction (before signing):", serializedTx);

    // 签名交易
    const signedTransaction = await signTransaction(transaction);

    console.log("Signed transaction:", signedTransaction);

  }
  return (
    <div onClick={onClick}>sign message</div>
  )
}