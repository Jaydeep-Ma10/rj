// API Service Layer for centralized API calls
import api from '../utils/api';
import { API_ENDPOINTS, buildApiUrl, buildAssetUrl } from '../config/api';

// User Services
export const userService = {
  getBalanceByName: (name: string) => 
    fetch(buildApiUrl(API_ENDPOINTS.USER_BALANCE_BY_NAME(name))),
  
  getBalanceById: (id: number) => 
    fetch(buildApiUrl(API_ENDPOINTS.USER_BALANCE_BY_ID(id))),
  
  getProfileByName: (name: string) => 
    fetch(buildApiUrl(API_ENDPOINTS.USER_PROFILE_BY_NAME(name))),
  
  getProfileById: (id: number) => 
    fetch(buildApiUrl(API_ENDPOINTS.USER_PROFILE_BY_ID(id))),
  
  getDeposits: (name: string) => 
    fetch(buildApiUrl(API_ENDPOINTS.USER_DEPOSITS(name))),
  
  getWithdrawals: (name: string) => 
    fetch(buildApiUrl(API_ENDPOINTS.USER_WITHDRAWALS(name))),
};

// Transaction Services
export const transactionService = {
  submitManualDeposit: (formData: FormData) => 
    fetch(buildApiUrl(API_ENDPOINTS.MANUAL_DEPOSIT), {
      method: 'POST',
      body: formData,
    }),
  
  submitManualWithdraw: (data: any) => 
    fetch(buildApiUrl(API_ENDPOINTS.MANUAL_WITHDRAW), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

// Game Services
export const gameService = {
  getWingoHistory: (interval: string) => 
    fetch(buildApiUrl(API_ENDPOINTS.WINGO_HISTORY(interval))),
  
  getCurrentRound: (interval: string) => 
    fetch(buildApiUrl(API_ENDPOINTS.WINGO_CURRENT_ROUND(interval))),
  
  getMyBets: (userId: number) => 
    fetch(buildApiUrl(API_ENDPOINTS.WINGO_MY_BETS(userId))),
};

// Admin Services
export const adminService = {
  login: (credentials: { username: string; password: string }) => 
    api.post(API_ENDPOINTS.ADMIN_LOGIN, credentials),
};

// Asset Services
export const assetService = {
  getAssetUrl: (path: string) => buildAssetUrl(path),
};

// Helper function for handling API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
};
