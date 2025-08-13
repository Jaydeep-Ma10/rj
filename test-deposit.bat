@echo off
setlocal enabledelayedexpansion

echo Testing deposit functionality...

set BASE_URL=http://localhost:5000/api
set MOBILE=+1234567890
set PASSWORD=testpassword123

:: 1. Login to get token
echo.
echo [1/3] Logging in...
curl -X POST %BASE_URL%/login ^
  -H "Content-Type: application/json" ^
  -d "{\"mobile\":\"%MOBILE%\",\"password\":\"%PASSWORD%\"}" ^
  -o login_response.json

if %ERRORLEVEL% neq 0 (
    echo Error: Failed to make login request
    exit /b 1
)

type login_response.json
echo.

:: Check if jq is available
where jq >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Warning: jq not found. Install jq for better JSON parsing.
    echo Extracting token manually...
    for /f "tokens=*" %%a in ('type login_response.json ^| findstr /i "token"') do (
        set "line=%%a"
        set "line=!line:*"token":"=!"
        set "TOKEN=!line:~0,-2!"
    )
) else (
    for /f "tokens=*" %%a in ('type login_response.json ^| jq -r .token') do set "TOKEN=%%a"
)

echo Token: %TOKEN%
if "%TOKEN%"=="" (
    echo Error: Failed to extract token from response
    exit /b 1
)

:: 2. Create a test file if it doesn't exist
if not exist test-slip.jpg (
    echo [2/3] Creating test file...
    fsutil file createnew test-slip.jpg 1024
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to create test file
        exit /b 1
    )
)

:: 3. Make deposit request
echo.
echo [3/3] Making deposit request...
set "UTR=TEST%RANDOM%%RANDOM%"
echo Using UTR: %UTR%

echo.
echo Request details:
echo URL: %BASE_URL%/manual-deposit
echo Headers:
echo   Authorization: Bearer %TOKEN:~0,20%...
echo Form data:
echo   name: Test User
echo   mobile: %MOBILE%
echo   amount: 1000
echo   utr: %UTR%
echo   method: BANK_TRANSFER
echo   slip: @test-slip.jpg (image/jpeg)
echo.

curl -v -X POST %BASE_URL%/manual-deposit ^
  -H "Authorization: Bearer %TOKEN%" ^
  -F "name=Test User" ^
  -F "mobile=%MOBILE%" ^
  -F "amount=1000" ^
  -F "utr=%UTR%" ^
  -F "method=BANK_TRANSFER" ^
  -F "slip=@test-slip.jpg;type=image/jpeg" ^
  -o deposit_response.json

if %ERRORLEVEL% neq 0 (
    echo Error: Deposit request failed
) else (
    echo.
    echo Deposit response:
    type deposit_response.json
)

echo.
echo Test complete.
