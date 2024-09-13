import {Button} from "@/components/base/button";
import {useWallet} from "@solana/wallet-adapter-react";
import {useEffect, useMemo, useState} from "react";
import {encodeBase58} from "ethers";
import httpRequestUtil from "@/utils/httpRequest.util";
import {getAccountId} from "@/utils/common.utilt";

export default function CheckOrderlyKey() {
    const {publicKey} = useWallet();
    const [orderlyKey, setorderlyKey] = useState<string | undefined>();
    const [keyState, setKeyState] = useState<{
        expiration: string;
        key_status: string;
        orderly_key: string;
        scope: string;
    } | undefined>();
    const userAddress = useMemo(() => {
        if (!publicKey) {
            return
        }
        return encodeBase58(publicKey.toBytes());

    }, [publicKey]);

    useEffect(() => {
        if (!userAddress) {
            return;
        }
        console.log('-- useraddress', userAddress, `SOL:${userAddress}`);
        const key = window.localStorage.getItem(`SOL:${userAddress}`);
        if (!key) {
            return;
        }
        setorderlyKey(key);

    }, [userAddress])


    const onCheckAccount = () => {
        if (!userAddress) {
            return;
        }
        const accountId = getAccountId(userAddress, 'woofi_pro')

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
            <Button onClick={onCheckAccount}>check orderlyKey</Button>
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