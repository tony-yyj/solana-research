import axios from "axios";
// apiBaseUrl: "https://qa-api-evm.orderly.org",
// apiBaseUrl: "https://dev-api-iap-v2.orderly.org",
// apiBaseUrl: "https://testnet-api-evm.orderly.org",

interface IResponse<T> {
    success: boolean;
    data: T
}
const instance = axios.create({
    baseURL: "https://dev-api-iap-v2.orderly.org",
})

instance.interceptors.response.use(
    (response) => {
        return response.data;

    },
    (error) => {
        return Promise.reject(error);
    }
)

function get<T>(url: string, params?: object):Promise<IResponse<T>> {
    return instance.get(url, params);
}

function post<T>(url: string, data?: object): Promise<IResponse<T>> {
    return instance.post(url, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

const httpRequest = {
    get,
    post,

}

export default httpRequest;