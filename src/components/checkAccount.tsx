import {Button} from "@/components/base/button";
import httpRequestUtil from "@/utils/httpRequest.util";
import {useWallet} from "@solana/wallet-adapter-react";
import {useMemo, useState} from "react";
import {encodeBase58} from "ethers";

export default function CheckAccount() {
    const {publicKey} = useWallet();
    const [accountInfo, setAccountInfo] = useState<{ user_id: string; account_id: string } | undefined>();
    const userAddress = useMemo(() => {
        if (!publicKey) {
            return
        }
        return encodeBase58(publicKey.toBytes());

    }, [publicKey]);

    const onCheckAccount = () => {
        if (!userAddress) {
            return;
        }
        httpRequestUtil.get<{ user_id: string; account_id: string }>(`/v1/get_account`, {
            address: userAddress,
            broker_id: 'woofi_pro',
            chain_type: 'SOL',

        }).then(res => {
            if (res.success) {
                setAccountInfo(res.data)
            }
        })
    }
    return (
        <div className='border border-black rounded-md px-3 py-2'>
            <h2>Check if current address is registered</h2>
            <Button onClick={onCheckAccount}>check if register</Button>
            {
                accountInfo &&

                <div>
                    <p>user_address: {userAddress}</p>
                    <p>user_id: {accountInfo?.user_id}</p>
                    <p>account_id: {accountInfo?.account_id}</p>
                </div>
            }
        </div>
    )
}