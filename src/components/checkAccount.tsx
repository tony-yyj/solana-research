import {Button} from "@/components/base/button";
import httpRequestUtil from "@/utils/httpRequest.util";
import {useState} from "react";
import {useWalletAdapterContext} from "@/app/WalletAdapterContext";

export default function CheckAccount() {
    const {userAddress, brokerId} = useWalletAdapterContext();
    const [accountInfo, setAccountInfo] = useState<{ user_id: string; account_id: string } | undefined>();


    const onCheckAccount = () => {
        if (!userAddress) {
            return;
        }
        httpRequestUtil.get<{ user_id: string; account_id: string }>(`/v1/get_account`, {
            address: userAddress,
            broker_id: brokerId,
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