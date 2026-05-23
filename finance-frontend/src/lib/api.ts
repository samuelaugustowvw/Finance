import axios from 'axios'

const isProd = import.meta.env.PROD

export const api = axios.create({
  baseURL: isProd
    ? 'https://finance-production-e7a5.up.railway.app'
    : 'http://localhost:3333',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finance:token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})