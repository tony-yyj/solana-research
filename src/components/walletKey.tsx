import { Button } from "@/components/base/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { hexToBytes } from "ethereum-cryptography/utils";
import * as bip39 from "bip39";
import { decodeBase58 } from "ethers";


export default function WalletKey(){
  const {connection} = useConnection();
  const {publicKey} = useWallet();
  const onClick = () => {
    const secretKey = '5BX1UDn3bU2aoEJ1zrEwaemEvyXNUfQdiZtJw6dJSKHcwVE9ZU7C8rHGqba2qqhvqYdZvdXNAfV24xL5Kcji5ybZ';
    // const bs = decodeBase58(secretKey);
    // const sec =Buffer.from(decodeBase58(secretKey));
    const sec = hexToBytes(decodeBase58(secretKey).toString(16));


    // const mnemonic = "away spoil leave chunk north girl rule life exhibit knock nasty eager";
    // console.log('bip39', bip39);
    // const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
    // const keypair = Keypair.fromSeed(seed.slice(0, 32));
    const keypair = Keypair.fromSecretKey(sec);

    console.log(keypair.publicKey.toBase58());
    console.log(publicKey?.toBase58());
    console.log('-- wallet key info', {
     'publicKey': keypair.publicKey.toBase58(),
      'secretKey':keypair.secretKey,
      'sec': keypair.secretKey.toString(),
    });


  };
  return (
    <div>
      <h2>wallet key</h2>

      <Button onClick={onClick}>get wallet key(secret key)</Button>

    </div>
  )
}