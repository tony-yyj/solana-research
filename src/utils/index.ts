
export function int2hex(chainId: number | string) {
    let id = chainId;
    if (typeof chainId === "string") {
        id = parseInt(chainId);
    }
    return `0x${id.toString(16)}`;
}

export const hex2int = (chainId: string): number => parseInt(chainId);

export function convertObjectBigIntToString(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const newObj: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (typeof value === 'bigint') {
                newObj[key] = value.toString();
            } else if (typeof value === 'object' && value !== null) {
                newObj[key] = convertObjectBigIntToString(value);
            } else {
                newObj[key] = value;
            }
        }
    }

    return newObj
}
