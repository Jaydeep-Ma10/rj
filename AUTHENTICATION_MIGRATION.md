# Authentication Migration: Username to Mobile Number

## Overview
This document outlines the migration from username-based authentication to mobile number-based authentication in the application. The change was implemented to enhance security and improve the user experience by using mobile numbers as the primary user identifier.

## Changes Made

### Backend Changes
1. **Authentication Controller (`authController.js`)**
   - Updated login and signup logic to use `mobile` instead of `name`
   - Modified JWT token payload to include `mobile` instead of `name`
   - Updated input validation to require mobile numbers

2. **User Controller (`userController.js`)**
   - Modified user lookup to use `mobile` as the primary identifier
   - Updated profile and balance endpoints to work with mobile numbers
   - Ensured all user-related operations use mobile number for identification

3. **Deposit/Withdraw Controllers**
   - Updated `manualDepositController.js` and `manualWithdrawController.js`
   - Changed user lookup from `name` to `mobile`
   - Modified validation to work with mobile numbers

4. **Routes (`userRoutes.js`)**
   - Updated route parameters from `:name` to `:mobile`
   - Ensured all user-related routes use mobile number for identification

### Database Changes
- The `mobile` field in the `User` model already had a unique constraint
- No schema migration was required as the field already existed

## API Changes

### Authentication Endpoints
- **Old (Deprecated)**:
  ```
  POST /api/auth/login
  {
    "name": "username",
    "password": "password123"
  }
  ```

- **New**:
  ```
  POST /api/auth/login
  {
    "mobile": "+1234567890",
    "password": "password123"
  }
  ```

### User Endpoints
- **Old (Deprecated)**: `GET /api/user/balance/:name`
- **New**: `GET /api/user/balance/:mobile`

## Testing

### Test Cases
1. **Mobile Login**
   - Verify login with mobile number and password works
   - Verify login with old username fails
   - Verify JWT token contains mobile number in payload

2. **User Operations**
   - Test user profile access with mobile number
   - Verify balance checks work with mobile number
   - Test deposit/withdrawal operations

3. **Edge Cases**
   - Invalid mobile number format
   - Non-existent mobile number
   - Duplicate mobile number prevention

## Rollback Plan
In case of issues, the following rollback steps should be taken:

1. Revert all controller changes to use `name` instead of `mobile`
2. Revert route changes to use `:name` parameters
3. Update JWT token payload to include `name` again
4. Test all endpoints to ensure proper functionality

## Impact
- **Frontend**: Must be updated to use mobile number for all authentication and user operations
- **API Clients**: Need to update to use the new mobile-based endpoints
- **Documentation**: API documentation should be updated to reflect these changes

## Future Considerations
- Implement OTP-based login for enhanced security
- Add support for international phone numbers
- Consider implementing multi-factor authentication
