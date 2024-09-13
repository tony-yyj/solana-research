'use client';
import InitSolana from "@/app/initSolana";
import WalletBalance from "@/app/walletBalance";
import {WalletDisconnectButton, WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import OrderlyKeyButton from "@/components/OrderlyKeyButton";
import RegisterAccount from "@/components/registerAccount";
import CheckAccount from "@/components/checkAccount";
import CheckOrderlyKey from "@/components/checkOrderlyKey";

export default function Home() {
    return (
        <InitSolana>
            <div className='px-5 py-3'>
                <div suppressHydrationWarning>

                    <WalletMultiButton/>
                    <WalletDisconnectButton/>
                </div>
                <div className='w-full h-[1px] bg-black'/>
                <div>
                    <WalletBalance/>
                </div>
                <div className='w-full h-[1px] bg-black'/>
                <div className='flex gap-5'>
                    <CheckAccount/>
                    <CheckOrderlyKey/>
                </div>
                <div className='flex gap-5'>

                    <RegisterAccount/>
                    <OrderlyKeyButton/>
                </div>
            </div>
        </InitSolana>
    );
}
