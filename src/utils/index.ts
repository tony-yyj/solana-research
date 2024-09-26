
export function int2hex(chainId: number | string) {
    let id = chainId;
    if (typeof chainId === "string") {
        id = parseInt(chainId);
    }
    return `0x${id.toString(16)}`;
}

export const hex2int = (chainId: string): number => parseInt(chainId);
