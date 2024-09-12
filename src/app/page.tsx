'use client';
import InitSolana from "@/app/initSolana";
import WalletBalance from "@/app/walletBalance";
import {WalletDisconnectButton, WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import OrderlyKeyButton from "@/components/OrderlyKeyButton";

export default function Home() {
    return (
        <InitSolana>
            <div>
                <div suppressHydrationWarning>

                    <WalletMultiButton/>
                    <WalletDisconnectButton/>
                </div>
                <div className='w-full h-[1px] bg-black'/>
                <div>
                    <WalletBalance/>
                </div>
                <div className='w-full h-[1px] bg-black'/>
                <div>
                    <OrderlyKeyButton/>
                </div>
            </div>
        </InitSolana>
    );
}
