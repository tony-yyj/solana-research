import axios, {AxiosRequestConfig} from "axios";
// import JSONBig from 'json-bigint';
// apiBaseUrl: "https://qa-api-evm.orderly.org",
// apiBaseUrl: "https://dev-api-iap-v2.orderly.org",
// apiBaseUrl: "https://testnet-api-evm.orderly.org",

interface IResponse<T> {
    success: boolean;
    data: T
}
const instance = axios.create({
    // baseURL: "https://dev-api-v2.orderly.org",
    baseURL: "https://qa-api-evm.orderly.org",
    headers: {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
    }
})

// instance.defaults.transformRequest = [
//   data => {
//   JSONBig
//     return JSON.stringify(data, bigIntReplacer);
//   }
// ]

instance.interceptors.response.use(
    (response) => {
        return response.data;

    },
    (error) => {
        return Promise.reject(error);
    }
)

function get<T>(url: string, params?: object, config?: AxiosRequestConfig):Promise<IResponse<T>> {
    return instance.get(url,{params, ...config} );
}

function post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<IResponse<T>> {
    return instance.post(url, data, {...config});
}

const httpRequest = {
    get,
    post,

}

export default httpRequest;