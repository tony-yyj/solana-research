import {Button} from "@/components/base/button";
import { useState} from "react";
import httpRequestUtil from "@/utils/httpRequest.util";
import {getAccountId} from "@/utils/common.utilt";
import {recoverOrderlyKeyPair} from "@/utils/orderlyKey.util";
import {useWalletAdapterContext} from "@/app/WalletAdapterContext";

export default function CheckOrderlyKey() {
    const {userAddress, brokerId, secretKey} = useWalletAdapterContext();
    const [keyState, setKeyState] = useState<{
        expiration: string;
        key_status: string;
        orderly_key: string;
        scope: string;
    } | undefined>();


    const onCheckOrderlyKey = () => {
        if (!userAddress) {
            return;
        }
        if (!secretKey) return;
        console.log('-- secretKey', secretKey);

        const {orderlyKey} = recoverOrderlyKeyPair(secretKey);
        console.log('--orderlyKey', orderlyKey);

        if (!orderlyKey) return;

        const accountId = getAccountId(userAddress, brokerId)

        httpRequestUtil.get<{
            expiration: string;
            key_status: string;
            orderly_key: string;
            scope: string;
        }>(`/v1/get_orderly_key`, {
            account_id: accountId,
            orderly_key: orderlyKey,
        }).then(res => {
            console.log('--- orderlykey state', res)
            if (res.success) {
                setKeyState(res.data)
            }
        })

    }


    return (
        <div className='border border-black rounded-md px-3 py-2'>
            <h2>check orderlyKey status</h2>
            <Button onClick={onCheckOrderlyKey}>check orderlyKey</Button>
            {
                keyState &&

                <div>
                    <h3>orderlyKey info</h3>
                    <p>expiration: {keyState?.expiration}</p>
                    <p>key status: {keyState?.key_status}</p>
                    <p>orderly_key: {keyState?.orderly_key}</p>
                    <p>scope: {keyState?.scope}</p>
                </div>
            }
        </div>
    )

}