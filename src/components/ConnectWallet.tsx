import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";

export default function ConnectWallet(){
    const {namespace, setNamespace, walletAdapter} = useWalletAdapterContext();
    return (
        <div>
            <h2>Connect wallet</h2>
            <div>
                set current env namespace:<Button onClick={() => setNamespace('EVM')}>set EVM</Button><Button onClick={() => setNamespace('SOL')}>set SOL</Button>

            </div>
            <div>
                current namespace: {namespace}
            </div>
            <div>
                <Button onClick={() => walletAdapter?.connect()}>Connect Wallet</Button>
            </div>
            <div className='flex gap-5 items-center'>
                <p>
                    userAddress: {walletAdapter?.userAddress}
                </p>
                <Button onClick={() => walletAdapter?.disconnect()}>Disconnect Wallet</Button>
            </div>
        </div>
    )
}