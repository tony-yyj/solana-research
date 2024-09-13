import {Button} from "@/components/base/button";
import httpRequestUtil from "@/utils/httpRequest.util";
import {useWallet} from "@solana/wallet-adapter-react";
import {getRegistrationDataBody} from "@/utils/signatureBody.util";
import {signRegisterData} from "@/utils/walletSign.util";


export default function RegisterAccount() {
    const {signMessage, publicKey} = useWallet();

    const getRegistrationNonce = async () => {
        const res = await httpRequestUtil.get<{ registration_nonce: number }>(`/v1/registration_nonce`);
        if (res.success) {
            return res.data.registration_nonce;
        }
        return Promise.reject('error: no registration nonce');
    }
    const onRegister = async () => {
        if (!signMessage) return;
        if (!publicKey) return;
        try {

            const nonce = await getRegistrationNonce()
            console.log('nonce', nonce)
            if (!nonce) return;
            const timestamp = BigInt(Date.now());
            const signature = await signRegisterData({
                signMessage,
                timestamp,
                brokerId: 'woofi_pro',
                chainId: BigInt(920920),
                registrationNonce: BigInt(nonce),
            })
            console.log('-- signature', signature)
            if (!signature) return;

            const accountRegistrationBody =getRegistrationDataBody({
                publicKey,
                signature,
                timestamp,
                brokerId: 'woofi_pro',
                chainId: BigInt(920920),
                registrationNonce: BigInt(nonce),

            });

            console.log('-- accountRegistrationBody', accountRegistrationBody)
            httpRequestUtil.post(`/v1/register_account`, accountRegistrationBody).then(res => {
                console.log('-- register account res', res);
            })


        } catch (error) {
            console.log('-- register error', error);
        }

    }
    return (
        <div>
            <h2>1. register account</h2>
            <Button onClick={onRegister}>Register account</Button>

        </div>
    )
}