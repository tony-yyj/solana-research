import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";

export default function ConnectWallet(){
    const {walletAdapter, onConnect} = useWalletAdapterContext();
    return (
        <div>
            <h2>Connect wallet</h2>
            <div>
                <Button onClick={() => onConnect()}>Connect Wallet</Button>
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