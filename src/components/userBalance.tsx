import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";
import httpRequestUtil from "@/utils/httpRequest.util";
import {recoverOrderlyKeyPair} from "@/utils/orderlyKey.util";
import {signatureByOrderlyKey} from "@/utils/signatureByOrderlyKey.util";
import {useState} from "react";

interface BalanceResponseInterface {
    holding: [
        {
            token: string;
            holding: number;
            frozen: number;
            pending_short: number;
            updated_time: number;
        }
    ]
}

export default function UserBalance() {
    const {walletAdapter} = useWalletAdapterContext();
    const [usdcBalance, setUsdcBalance] = useState<number>(0);
    const userAddress = walletAdapter?.userAddress;
    const accountId = walletAdapter?.accountId;
    const orderlyKeyInfo = walletAdapter?.orderlyKeyInfo;

    const onGetUserBalance = () => {

        if (!userAddress ||  !orderlyKeyInfo || !accountId) return;


        const {keyPair} = recoverOrderlyKeyPair(orderlyKeyInfo.secretKey);
        if (!keyPair) return;

        const headers = signatureByOrderlyKey({
            url: '/v1/client/holding',
            method: 'GET',
            accountId,
            keyPair,
        })
        console.log('-- headers', headers, JSON.stringify(headers));

        httpRequestUtil.get<BalanceResponseInterface>(`v1/client/holding`, {}, {
            headers,
        }).then(res => {
            console.log('-- user balance', res);
            if (res.success) {
                if (res.data.holding.length) {
                    const usdc = res.data.holding.find(item => item.token === 'USDC')
                    if (usdc) {
                        setUsdcBalance(usdc.holding);
                    }
                }
                res.data.holding
            }
        });
    }

    return (
        <div>
            <h2>
                get user Balance in woofipro
            </h2>
            <Button onClick={onGetUserBalance}>get balance</Button>
            <p>USDC holding: {usdcBalance} USDC</p>
        </div>
    )
}