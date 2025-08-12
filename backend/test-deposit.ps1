# Test script for manual deposit endpoint

# Login and get token
Write-Host "Logging in..."
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
    Write-Host "✅ Login successful. Token obtained."

    # Prepare deposit data
    $depositData = @{
        name = "TestUser"
        mobile = "9876543210"
        amount = 1000
        utr = "TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
        method = "TEST"
    } | ConvertTo-Json -Compress | ConvertFrom-Json | ConvertTo-Json  # This ensures proper JSON formatting

    Write-Host "Sending deposit request with data: $($depositData | ConvertTo-Json)"

    # Make deposit request
    $depositResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/manual-deposit" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body ($depositData | ConvertTo-Json) `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "✅ Deposit request sent successfully."
    Write-Host "Response Status: $($depositResponse.StatusCode) $($depositResponse.StatusDescription)"
    Write-Host "Response Body: $($depositResponse.Content)"
} catch {
    Write-Host "❌ Error occurred:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    Write-Host "Response: $($_.ErrorDetails.Message)"
    Write-Host "Full Error: $_"
}
