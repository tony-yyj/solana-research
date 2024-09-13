import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/app/WalletAdapterContext";
import httpRequestUtil from "@/utils/httpRequest.util";
import {recoverOrderlyKeyPair} from "@/utils/orderlyKey.util";
import {signatureByOrderlyKey} from "@/utils/signatureByOrderlyKey.util";

export default function UserBalance(){
    const {userAddress, brokerId} =useWalletAdapterContext();

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

        httpRequestUtil.get(`v1/client/holding`, {}, {
            headers,
        }).then(res=>{
            console.log('-- user balance', res);
        });
    }

    return (
        <div>
            <h2>
                get user Balance in woofipro
            </h2>
           <Button onClick={onGetUserBalance}>get balance</Button>
        </div>
    )
}