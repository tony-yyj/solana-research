'use client';
import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";

export default function OrderlyKeyButton(){
    const {walletAdapter,} = useWalletAdapterContext();
    const setOrderlyKey = walletAdapter?.setOrderlyKey;
    const {orderlyKeyInfo} = walletAdapter ?? {};


    const onSetOrderlyKey = async () => {
        try {
            if (!setOrderlyKey) {
               return;
            }
            setOrderlyKey().then(res => {
                console.log('-- res', res)

            })

        } catch (e) {
            console.log('-- set orderly key error', e);

        }

    }

    return (
      <div className='border border-black rounded-md px-3 py-2'>
        <h2>

          2. set orderly key
        </h2>
        <Button onClick={onSetOrderlyKey}>
          set orderly key
        </Button>
        <div className='max-w-[600px] break-all'>
          <h3>secret key:</h3>
          <p> {orderlyKeyInfo?.secretKey}</p>
          <h3>public key:</h3>
          <p> {orderlyKeyInfo?.publicKey}</p>
        </div>
      </div>
    )
}