'use client';
import WalletBalance from "@/app/walletBalance";
import {WalletDisconnectButton, WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import OrderlyKeyButton from "@/components/OrderlyKeyButton";
import RegisterAccount from "@/components/registerAccount";
import CheckAccount from "@/components/checkAccount";
import CheckOrderlyKey from "@/components/checkOrderlyKey";
import UserBalance from "@/components/userBalance";
import SettlePnl from "@/components/settlePnl";
import Withdraw from "@/components/withdraw";
import WithdrawHistory from "@/components/withdrawHistory";
import {AppProvider} from "@/app/AppProvider";
import ConnectWallet from "@/components/ConnectWallet";
import ChainList from "@/components/ChainList";
import {WalletAdapterContextProvider} from "@/context/WalletAdapterContext";
import InitSolana from "@/context/initSolana";

export default function Home() {
    return (
        <AppProvider>

            <InitSolana>
                <WalletAdapterContextProvider>

                    <div className='px-5 py-3'>
                        <div suppressHydrationWarning>

                            <WalletMultiButton/>
                            <WalletDisconnectButton/>
                        </div>
                        <div>
                            <ChainList/>
                        </div>
                        <div>
                            <ConnectWallet/>
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

                    </div>

                </WalletAdapterContextProvider>
            </InitSolana>

        </AppProvider>
    );
}
