import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/app/WalletAdapterContext";
import httpRequestUtil from "@/utils/httpRequest.util";
import {signatureByOrderlyKey} from "@/utils/signatureByOrderlyKey.util";
import {recoverOrderlyKeyPair} from "@/utils/orderlyKey.util";

export default function WithdrawHistory(){
    const {userAddress, secretKey, brokerId} = useWalletAdapterContext();


    const onGetWithdrawHistory = async () => {
        if (!secretKey) return;
        if (!userAddress) return;

        const {keyPair} = recoverOrderlyKeyPair(secretKey)
        if (!keyPair) return;
        const params = {
            side: 'WITHDRAW',
            page: 1,
            size: 5,
        }

        const headers = signatureByOrderlyKey({
            url: '/v1/asset/history',
            method: 'GET',
            params,
            brokerId,
            keyPair,
            userAddress,

        })

        httpRequestUtil.get('/v1/asset/history', params, {headers}).then(res => {
            console.log('--- res', res);
        })
    }
    return (
        <div>
            <h2>withdraw history</h2>
            <Button onClick={onGetWithdrawHistory}>get withdraw history</Button>
        </div>


    )
}