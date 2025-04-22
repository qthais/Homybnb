import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Backend API base URL
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allows cookies & authentication headers
});
export default axiosClient