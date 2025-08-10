# AWS S3 Setup Guide for Transaction Slip Uploads

## Overview
This guide explains how to set up AWS S3 integration for transaction slip uploads in the Wingo backend. The system supports both S3 and local storage with automatic fallback.

## 🚀 Quick Setup

### 1. AWS S3 Configuration

#### Create S3 Bucket
1. Log into AWS Console
2. Navigate to S3 service
3. Create a new bucket with these settings:
   - **Bucket Name**: `wingo-transaction-slips` (or your preferred name)
   - **Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: Keep enabled (files will be private)
   - **Versioning**: Optional (recommended for production)

#### Create IAM User
1. Navigate to IAM service
2. Create new user: `wingo-s3-uploader`
3. Attach policy with these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::wingo-transaction-slips/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::wingo-transaction-slips"
        }
    ]
}
```

#### Get Access Keys
1. Select the created user
2. Go to "Security credentials" tab
3. Create access key
4. Save the Access Key ID and Secret Access Key

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# AWS S3 Configuration for Transaction Slips
AWS_ACCESS_KEY_ID="your-access-key-id-here"
AWS_SECRET_ACCESS_KEY="your-secret-access-key-here"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="wingo-transaction-slips"
```

### 3. Database Migration

Run the database migration to update the schema:

```bash
npx prisma migrate dev --name add-transaction-slip-s3-support
```

Or generate and push the schema:

```bash
npx prisma generate
npx prisma db push
```

## 📋 Features

### Automatic Fallback
- **With S3 configured**: Files upload to S3 with signed URLs for secure access
- **Without S3 configured**: Files upload to local `uploads/transaction-slips/` directory
- **Hybrid support**: Existing local files continue to work alongside new S3 files

### File Management
- **Supported formats**: JPEG, PNG, GIF, WebP, PDF
- **File size limit**: 10MB maximum
- **Security**: Private S3 access with signed URLs (1-hour expiry)
- **Organization**: Files stored in `transaction-slips/{userId}/{timestamp}-{filename}` structure

### Database Integration
- **FileUpload model**: Tracks all uploaded files with metadata
- **ManualDeposit model**: Enhanced with S3 metadata, approval/rejection tracking
- **User relations**: Proper foreign key relationships for data integrity

## 🧪 Testing

### 1. Test Page
Access the test page at: `http://localhost:5000/transaction-slip-test.html`

### 2. Manual Testing
```bash
# Start the server
npm start

# Test S3 configuration
curl -X GET http://localhost:5000/api/health

# Test file upload
curl -X POST http://localhost:5000/api/manual-deposit \
  -F "name=Test User" \
  -F "mobile=9876543210" \
  -F "amount=1000" \
  -F "utr=TEST123456" \
  -F "method=UPI" \
  -F "slip=@/path/to/test-slip.jpg"
```

### 3. Admin Testing
```bash
# Get all deposits (with signed URLs for S3 slips)
curl -X GET http://localhost:5000/api/admin/deposits

# Get specific deposit details
curl -X GET http://localhost:5000/api/admin/deposits/1

# Approve deposit
curl -X POST http://localhost:5000/api/admin/deposits/1/verify

# Reject deposit with reason
curl -X POST http://localhost:5000/api/admin/deposits/1/reject \
  -H "Content-Type: application/json" \
  -d '{"reason": "Invalid transaction slip"}'
```

## 🔧 Configuration Options

### Environment Variables Reference
```env
# Required for S3 (leave empty for local storage fallback)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME=""

# File upload limits
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES="jpg,jpeg,png,gif,webp,pdf"

# S3 signed URL expiry (seconds)
S3_SIGNED_URL_EXPIRY=3600
```

### Local Storage Fallback
If AWS credentials are not configured, the system automatically falls back to local storage:
- Files stored in: `uploads/transaction-slips/`
- Access via: `http://localhost:5000/uploads/transaction-slips/filename.jpg`
- No signed URLs needed for local files

## 🛡️ Security Features

### S3 Security
- **Private bucket**: No public access to uploaded files
- **Signed URLs**: Temporary access (1-hour expiry) for viewing slips
- **IAM permissions**: Minimal required permissions for S3 operations
- **Metadata tracking**: User ID, upload type, and timestamps in S3 metadata

### Application Security
- **File validation**: MIME type and size validation
- **User authentication**: Files linked to authenticated users
- **Admin approval**: Manual review process for all deposits
- **Audit logging**: All upload and approval actions logged

## 🚨 Troubleshooting

### Common Issues

#### 1. S3 Upload Fails
```
Error: Failed to upload transaction slip to S3
```
**Solutions:**
- Check AWS credentials in `.env` file
- Verify S3 bucket exists and is accessible
- Check IAM permissions for the user
- Ensure bucket region matches `AWS_REGION`

#### 2. Signed URL Generation Fails
```
Error: Failed to generate signed URL
```
**Solutions:**
- Verify S3 object exists
- Check IAM permissions include `s3:GetObject`
- Ensure AWS credentials are valid

#### 3. Database Migration Issues
```
Error: Column 'metadata' does not exist
```
**Solutions:**
- Run `npx prisma migrate dev`
- Or run `npx prisma db push` to sync schema
- Check database connection in `DATABASE_URL`

#### 4. File Size Limit Exceeded
```
Error: File too large
```
**Solutions:**
- Reduce file size to under 10MB
- Compress images before upload
- Check `MAX_FILE_SIZE_MB` environment variable

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📈 Production Recommendations

### S3 Configuration
- Enable versioning for file recovery
- Set up lifecycle policies for cost optimization
- Configure CloudFront for faster global access
- Enable server-side encryption (SSE-S3 or SSE-KMS)

### Monitoring
- Set up CloudWatch alarms for S3 operations
- Monitor upload success/failure rates
- Track storage costs and usage patterns
- Log all file operations for audit trails

### Backup Strategy
- Enable S3 Cross-Region Replication
- Regular database backups including file metadata
- Document recovery procedures for file restoration

## 🔄 Migration from Local to S3

If you have existing local files and want to migrate to S3:

1. **Backup existing files**
2. **Update environment variables** with S3 credentials
3. **Restart server** - new uploads will go to S3
4. **Optional**: Migrate existing files using a custom script
5. **Update admin panel** to handle both local and S3 URLs

The system supports hybrid operation, so existing local files will continue to work while new uploads go to S3.

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Test with the provided test page
4. Verify AWS credentials and permissions

The transaction slip upload system is now production-ready with AWS S3 integration! 🎉
