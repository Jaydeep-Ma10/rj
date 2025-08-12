# Test script for manual deposit endpoint with detailed logging

# Function to log messages with timestamp
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

# Login and get token
Write-Log "Logging in..."
$loginBody = @{
    name = "TestUser"
    password = "Test@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing `
        -ErrorAction Stop

    $response = $loginResponse.Content | ConvertFrom-Json
    $token = $response.token
    Write-Log "✅ Login successful. Token obtained."

    # Prepare deposit data
    $depositData = @{
        name = "TestUser"
        mobile = "9876543210"
        amount = 1000
        utr = "TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
        method = "TEST"
    }

    Write-Log "Sending deposit request with data: $($depositData | ConvertTo-Json -Depth 5)"

    # Make deposit request
    $depositResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/manual-deposit" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body ($depositData | ConvertTo-Json -Depth 5) `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Log "✅ Deposit request sent successfully."
    Write-Log "Response Status: $($depositResponse.StatusCode) $($depositResponse.StatusDescription)"
    Write-Log "Response Body: $($depositResponse.Content)"
} catch {
    Write-Log "❌ Error occurred:"
    Write-Log "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Log "Status Description: $($_.Exception.Response.StatusDescription)"
    
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorResponse) {
            Write-Log "Error Response: $($errorResponse | ConvertTo-Json -Depth 5)"
        } else {
            Write-Log "Response: $($_.ErrorDetails.Message)"
        }
    } catch {
        Write-Log "Could not parse error response: $_"
    }
    
    Write-Log "Full Error: $_"
    Write-Log "Stack Trace: $($_.ScriptStackTrace)"
}
