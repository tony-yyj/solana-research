import { Button } from "@/components/base/button";
import { useWalletAdapterContext } from "@/context/WalletAdapterContext";

export default function Deposit(){
  const {walletAdapter} = useWalletAdapterContext();
  const onDeposit = () => {
    if (!walletAdapter || !walletAdapter.deposit) {
     return;
    }

    walletAdapter.deposit();

  }
  return (
    <div className='border border-black rounded-md px-3 py-2'>
      <h2>Deposit</h2>

      <div>
        wallet usdc balance:
      </div>

      <div>
        <Button onClick={onDeposit}>deposit</Button>
      </div>

    </div>
  )
}