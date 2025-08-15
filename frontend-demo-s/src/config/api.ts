// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  API_PREFIX: '/api',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  ADMIN_LOGIN: '/admin/login',
  
  // User Management
  USER_BALANCE_BY_NAME: (name: string) => `/user/${encodeURIComponent(name)}/balance`,
  USER_BALANCE_BY_ID: (id: number) => `/user/id/${id}/balance`,
  USER_PROFILE_BY_NAME: (name: string) => `/user/${encodeURIComponent(name)}/profile`,
  USER_PROFILE_BY_ID: (id: number) => `/user/id/${id}/profile`,
  
  // Transactions
  USER_DEPOSITS: (name: string) => `/user/${encodeURIComponent(name)}/deposits`,
  USER_WITHDRAWALS: (name: string) => `/user/${encodeURIComponent(name)}/withdrawals`,
  MANUAL_DEPOSIT: '/manual-deposit',
  MANUAL_WITHDRAW: '/manual-withdraw',
  
  // Game APIs
  WINGO_HISTORY: (interval: string) => `/wingo/history?interval=${encodeURIComponent(interval)}`,
  WINGO_CURRENT_ROUND: (interval: string) => `/wingo/round/current?interval=${encodeURIComponent(interval)}`,
  WINGO_MY_BETS: (userId: number) => `/wingo/my-bets?userId=${userId}`,
} as const;

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

// Helper function to build asset URL (for images, files)
export const buildAssetUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // Already absolute URL
  }
  return `${API_CONFIG.BASE_URL}${path}`;
};
