# Frontend API Configuration Guide

## Overview

The frontend has been refactored to use environment-based API configuration instead of hardcoded URLs. This provides better flexibility for development, staging, and production environments.

## Environment Files

### `.env` (Development)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### `.env.production` (Production)
```env
VITE_API_BASE_URL=https://rj-755j.onrender.com
VITE_SOCKET_URL=https://rj-755j.onrender.com
```

## Configuration Files

### `src/config/api.ts`
Central configuration file containing:
- **API_CONFIG**: Base URLs and prefixes
- **API_ENDPOINTS**: All API endpoint definitions
- **buildApiUrl()**: Helper to build full API URLs
- **buildAssetUrl()**: Helper to build asset URLs (images, files)

### `src/services/apiService.ts`
Service layer providing organized API methods:
- **userService**: User-related API calls
- **transactionService**: Deposit/withdrawal operations
- **gameService**: Wingo game API calls
- **adminService**: Admin panel operations
- **assetService**: Asset URL handling

## Updated Files

### Core Configuration
- `src/utils/api.ts` - Axios instance now uses environment config
- `src/utils/socket.ts` - Socket.IO connection uses environment config
- `vite.config.ts` - Development proxy uses environment variables

### Game Components
- `src/games/wingo/WingoGame.tsx` - All API calls updated
- `src/games/wingo/components/WalletCard.tsx` - Balance fetching updated

### Page Components (11 files updated)
- `src/pages/Account.tsx` - Balance & profile APIs
- `src/pages/AllTransactions.tsx` - Transaction history
- `src/pages/Deposit.tsx` - Manual deposit submission
- `src/pages/DepositHistory.tsx` - Deposit history + image URLs
- `src/pages/TransactionHistory.tsx` - Transaction data
- `src/pages/Wallet.tsx` - Balance fetching
- `src/pages/Withdraw.tsx` - Withdrawal submission
- `src/pages/WithdrawHistory.tsx` - Withdrawal history
- `src/pages/admin/AdminDashboard.tsx` - Image URL handling
- `src/pages/admin/AdminLogin.tsx` - Admin authentication

## API Endpoints

### Authentication
- `POST /admin/login`

### User Management
- `GET /api/user/{name}/balance`
- `GET /api/user/id/{id}/balance`
- `GET /api/user/{name}/profile`
- `GET /api/user/id/{id}/profile`

### Transactions
- `GET /api/user/{name}/deposits`
- `GET /api/user/{name}/withdrawals`
- `POST /api/manual-deposit`
- `POST /api/manual-withdraw`

### Game APIs
- `GET /api/wingo/history?interval={interval}`
- `GET /api/wingo/round/current?interval={interval}`
- `GET /api/wingo/my-bets?userId={userId}`

## Usage Examples

### Using API Configuration
```typescript
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// Build API URL
const url = buildApiUrl(API_ENDPOINTS.USER_BALANCE_BY_ID(123));
// Result: http://localhost:5000/api/user/id/123/balance
```

### Using Service Layer
```typescript
import { userService, handleApiResponse } from '../services/apiService';

// Get user balance
const response = await userService.getBalanceById(123);
const data = await handleApiResponse(response);
```

### Asset URLs
```typescript
import { buildAssetUrl } from '../config/api';

// Handle both absolute and relative URLs
const imageUrl = buildAssetUrl('/uploads/slip.jpg');
// Result: http://localhost:5000/uploads/slip.jpg
```

## Environment Switching

### Development
```bash
npm run dev
# Uses .env file with localhost URLs
```

### Production Build
```bash
npm run build
# Uses .env.production file with production URLs
```

### Custom Environment
```bash
VITE_API_BASE_URL=https://staging.example.com npm run dev
# Override environment variables
```

## Benefits

1. **Environment Flexibility**: Easy switching between dev/staging/production
2. **Centralized Configuration**: All API endpoints in one place
3. **Type Safety**: TypeScript definitions for all endpoints
4. **Service Layer**: Organized API calls with error handling
5. **Asset Handling**: Smart URL building for images and files
6. **Development Proxy**: Vite proxy configuration uses environment variables

## Migration Notes

- All hardcoded `https://rj-755j.onrender.com` URLs have been replaced
- Image URLs now use `buildAssetUrl()` for proper handling
- Socket.IO connection automatically uses correct environment URL
- Admin panel S3 URL handling improved with smart URL detection
