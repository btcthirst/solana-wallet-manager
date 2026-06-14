import {
    address,
    appendTransactionMessageInstruction,
    createTransactionMessage,
    getBase58Decoder,
    lamports,
    pipe,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signAndSendTransactionMessageWithSigners,
    TransactionSigner,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { rpc } from "./rpc";

export async function transferSol(
    signer: TransactionSigner,
    recipientAddress: string,
    solAmount: number
): Promise<string> {
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const transferAmount = lamports(BigInt(Math.round(solAmount * 1_000_000_000)));

    const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(signer, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        (tx) =>
            appendTransactionMessageInstruction(
                getTransferSolInstruction({
                    source: signer,
                    destination: address(recipientAddress),
                    amount: transferAmount,
                }),
                tx
            )
    );

    const signatureBytes = await signAndSendTransactionMessageWithSigners(transactionMessage);
    return getBase58Decoder().decode(signatureBytes);
}