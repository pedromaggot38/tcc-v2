import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v0`,
  withCredentials: true,
});

export default api;
