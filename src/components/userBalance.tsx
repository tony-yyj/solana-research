import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/app/WalletAdapterContext";
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
    const {userAddress, brokerId} = useWalletAdapterContext();
    const [usdcBalance, setUsdcBalance] = useState<number>(0);

    const onGetUserBalance = () => {

        if (!userAddress) return;

        const secretKey = window.localStorage.getItem(`SOL:${userAddress}`);
        if (!secretKey) return;
        console.log('-- secretKey', secretKey);

        const {keyPair} = recoverOrderlyKeyPair(secretKey);
        if (!keyPair) return;

        const headers = signatureByOrderlyKey({
            url: '/v1/client/holding',
            method: 'GET',
            brokerId,
            userAddress,
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