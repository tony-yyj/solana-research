'use client';
import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";
import { useState } from "react";

export default function OrderlyKeyButton(){
    const {walletAdapter,} = useWalletAdapterContext();
    const setOrderlyKey = walletAdapter?.setOrderlyKey;
    const {orderlyKeyInfo} = walletAdapter ?? {};
    const [expiration, setExpiration] = useState<number>(1);


    const onSetOrderlyKey = async () => {
      const expirationTime = expiration * 24 * 3600
      if (Number.isNaN(expirationTime)) {
        return
      }
        try {
            if (!setOrderlyKey) {
               return;
            }
            setOrderlyKey(expirationTime).then(res => {
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
        <div className='flex items-center gap-4'>

          <div className='flex items-center gap-2'>

            <input placeholder="expiration" type={"number"} value={expiration} onChange={(e) => setExpiration(parseInt(e.target.value))} />
            day (default is 1 day)
          </div>

          <Button onClick={onSetOrderlyKey}>
            set new  orderly key
          </Button>
        </div>
        <div className='max-w-[600px] break-all'>
          <h3>secret key:</h3>
          <p> {orderlyKeyInfo?.secretKey}</p>
          <h3>public key:</h3>
          <p> {orderlyKeyInfo?.publicKey}</p>
        </div>
      </div>
    )
}