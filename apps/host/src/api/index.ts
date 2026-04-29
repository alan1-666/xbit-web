import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

const service: AxiosInstance = axios.create({
  baseURL: 'https://api.hyperliquid-testnet.xyz/info',
  // baseURL: 'https://api.hyperliquid.xyz/info',
  headers: {
    post: {
      "Content-Type": "application/json",
    },
  },
});

service.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (response: AxiosResponse): any => {
    const data = response.data;
    if (typeof data !== "object") {
      return Promise.reject(new Error("服务端异常"));
    }
  
    return data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function request<T = any>(
  config: AxiosRequestConfig
): Promise<T> {
  return service(config)
}
