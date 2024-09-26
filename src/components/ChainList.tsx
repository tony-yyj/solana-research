import {Button} from "@/components/base/button";
import {useChains} from "@/hooks/useChains";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";

export default function ChainList() {
    const chains = useChains();
    const {currentChain} = useWalletAdapterContext();
    return (
        <div>
            <div>
                <h2>Chains</h2>
            </div>
            <ul className='flex gap-3 items-center'>
                {chains.map(chain =>
                    <li key={chain.chain_id}>
                        <Button color={currentChain?.chain_id === chain.chain_id ? 'primary' : 'neutral'}>{chain.name}</Button>
                    </li>
                )}
            </ul>
        </div>
    )
}