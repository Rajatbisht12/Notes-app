// lib/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios'

// Environment-based configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'https://your-api-domain.com/api'
  : 'http://localhost:5000/api'

const DEFAULT_TIMEOUT = 30000 // 30 seconds

// Request queue for handling rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private concurrency = 3
  private activeRequests = 0

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process() {
    if (this.processing || this.activeRequests >= this.concurrency) {
      return
    }

    this.processing = true
    
    while (this.queue.length > 0 && this.activeRequests < this.concurrency) {
      const requestFn = this.queue.shift()
      if (requestFn) {
        this.activeRequests++
        requestFn().finally(() => {
          this.activeRequests--
          this.process()
        })
      }
    }
    
    this.processing = false
  }
}

const requestQueue = new RequestQueue()

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request ID for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID()
    
    // Add timestamp
    config.metadata = { startTime: Date.now() }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        timeout: config.timeout,
        requestId: config.headers['X-Request-ID']
      })
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate response time
    const duration = Date.now() - response.config.metadata?.startTime
    
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        duration: `${duration}ms`,
        requestId: response.config.headers['X-Request-ID']
      })
    }
    
    // Track successful requests (for monitoring)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_request_success', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration
      })
    }
    
    return response
  },
  (error: AxiosError) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now())
    
    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please try again.'
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your connection.'
    } else if (error.code === 'ERR_CANCELED') {
      error.message = 'Request was cancelled.'
    }
    
    // Log error
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      duration: `${duration}ms`,
      requestId: error.config?.headers['X-Request-ID']
    })
    
    // Track failed requests (for monitoring)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_request_error', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        error_code: error.code,
        duration
      })
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle authentication error
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
      return Promise.reject(new Error('Authentication required'))
    }
    
    if (error.response?.status === 429) {
      // Handle rate limiting
      return Promise.reject(new Error('Too many requests. Please wait a moment and try again.'))
    }
    
    if (error.response?.status >= 500) {
      // Handle server errors
      return Promise.reject(new Error('Server error. Please try again later.'))
    }
    
    return Promise.reject(error)
  }
)

// Enhanced API methods with retry logic
export const apiMethods = {
  async get<T>(url: string, config = {}): Promise<T> {
    return requestQueue.add(async () => {
      const response = await api.get(url, config)
      return response.data
    })
  },
  
  async post<T>(url: string, data?: any, config = {}): Promise<T> {
    return requestQueue.add(async () => {
      const response = await api.post(url, data, config)
      return response.data
    })
  },
  
  async put<T>(url: string, data?: any, config = {}): Promise<T> {
    return requestQueue.add(async () => {
      const response = await api.put(url, data, config)
      return response.data
    })
  },
  
  async delete<T>(url: string, config = {}): Promise<T> {
    return requestQueue.add(async () => {
      const response = await api.delete(url, config)
      return response.data
    })
  }
}

// Health check utility
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health', { timeout: 5000 })
    return response.status === 200
  } catch (error) {
    return false
  }
}

// Connection utility
export const checkConnection = async (): Promise<{
  isOnline: boolean
  isServerReachable: boolean
  latency?: number
}> => {
  const isOnline = navigator.onLine
  let isServerReachable = false
  let latency: number | undefined
  
  if (isOnline) {
    const startTime = Date.now()
    try {
      await api.get('/health', { timeout: 5000 })
      isServerReachable = true
      latency = Date.now() - startTime
    } catch (error) {
      isServerReachable = false
    }
  }
  
  return { isOnline, isServerReachable, latency }
}

export default api