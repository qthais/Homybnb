// utils/authenticatedRequest.ts
import { getSession } from '@/app/action/getCurrentUser';
import axiosClient from './axiosClient';

export const authenticatedAxios = async <T = any>(
  config: Parameters<typeof axiosClient.request>[0]
) => {
  const session = await getSession();
  // console.log("sessionInAuthRequest",session?.tokens)
  const token = session?.tokens?.accessToken;

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  // console.log('🔍 Authenticated Request Config:', {
  //   url: config.url,
  //   method: config.method,
  //   headers: config.headers,
  //   data: config.data,
  // });

  return axiosClient.request<T>(config);
};
