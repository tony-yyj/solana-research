'use client';
import InitSolana from "@/app/initSolana";
import WalletBalance from "@/app/walletBalance";
import {WalletDisconnectButton, WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import OrderlyKeyButton from "@/components/OrderlyKeyButton";
import RegisterAccount from "@/components/registerAccount";
import CheckAccount from "@/components/checkAccount";
import CheckOrderlyKey from "@/components/checkOrderlyKey";
import UserBalance from "@/components/userBalance";
import SettlePnl from "@/components/settlePnl";

export default function Home() {
    return (
        <InitSolana>
            <div className='px-5 py-3'>
                <div suppressHydrationWarning>

                    <WalletMultiButton/>
                    <WalletDisconnectButton/>
                </div>
                <div className='w-full h-[1px] my-3 bg-black'/>
                <div>
                    <WalletBalance/>
                </div>
                <div className='w-full h-[1px] my-3 bg-black'/>
                <div className='flex gap-5'>
                    <CheckAccount/>
                    <CheckOrderlyKey/>
                </div>
                <div className='w-full h-[1px] my-3 bg-black'/>
                <div className='flex gap-5'>

                    <RegisterAccount/>
                    <OrderlyKeyButton/>
                </div>
                <div className='w-full h-[1px] my-3 bg-black'/>
                <div className='flex gap-5'>
                    <UserBalance/>
                    <SettlePnl/>
                </div>
            </div>
        </InitSolana>
    );
}
