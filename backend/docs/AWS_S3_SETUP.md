# AWS S3 Setup Guide

## Overview

The Wingo backend supports both AWS S3 and local file storage for file uploads. If S3 is not configured, the system automatically falls back to local storage.

## Features

- **File Upload Categories**: KYC documents, profile images, deposit receipts
- **Security**: File type validation, size limits, virus scanning ready
- **Storage Options**: AWS S3 (production) or local storage (development)
- **Database Integration**: FileUpload model tracks all uploads
- **Audit Logging**: All file operations are logged

## AWS S3 Configuration

### 1. Create AWS S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Create a new bucket with these settings:
   ```
   Bucket name: your-wingo-uploads
   Region: us-east-1 (or your preferred region)
   Block public access: Keep enabled (we use signed URLs)
   Versioning: Enable (recommended)
   ```

### 2. Create IAM User

1. Navigate to IAM service
2. Create a new user: `wingo-s3-user`
3. Attach this custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::your-wingo-uploads/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-wingo-uploads"
        }
    ]
}
```

4. Generate Access Keys for the user

### 3. Environment Variables

Add these to your `.env` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-wingo-uploads"
```

## File Upload Endpoints

### Upload KYC Document
```bash
POST /api/files/upload/kyc
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Form Data:
- file: <file>
- category: "kyc_document"
- documentType: "aadhar" | "pan" | "passport" | "driving_license"
```

### Upload Profile Image
```bash
POST /api/files/upload/profile
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Form Data:
- file: <file>
- category: "profile_image"
```

### Upload Deposit Receipt
```bash
POST /api/files/upload/deposit
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Form Data:
- file: <file>
- category: "deposit_receipt"
```

### Get File URL
```bash
GET /api/files/file/:fileId/url
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://signed-s3-url-or-local-path",
    "filename": "document.pdf",
    "category": "kyc_document",
    "expiresIn": 3600
  }
}
```

### Get User Files
```bash
GET /api/files/files?category=kyc_document&page=1&limit=10
Authorization: Bearer <jwt-token>
```

### Delete File
```bash
DELETE /api/files/file/:fileId
Authorization: Bearer <jwt-token>
```

## File Validation Rules

### File Types
- **KYC Documents**: JPEG, PNG, PDF (max 10MB)
- **Profile Images**: JPEG, PNG (max 2MB)
- **Deposit Receipts**: JPEG, PNG, PDF (max 5MB)

### Security Features
- File type validation by MIME type
- File size limits per category
- Virus scanning ready (can be integrated)
- Secure file naming with timestamps and random strings
- User isolation (users can only access their own files)

## Database Models

### FileUpload Model
```prisma
model FileUpload {
  id          Int      @id @default(autoincrement())
  filename    String
  originalName String
  mimeType    String
  size        Int
  s3Key       String   @unique
  s3Bucket    String
  s3Url       String
  uploadedBy  Int?
  user        User?    @relation(fields: [uploadedBy], references: [id])
  category    String
  status      String   @default("active")
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### KycDocument Model
```prisma
model KycDocument {
  id          Int        @id @default(autoincrement())
  userId      Int
  user        User       @relation(fields: [userId], references: [id])
  documentType String
  fileUploadId Int?
  fileUpload  FileUpload? @relation(fields: [fileUploadId], references: [id])
  status      String     @default("pending")
  reviewedBy  Int?
  reviewedAt  DateTime?
  rejectionReason String?
  metadata    Json?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

## Testing

### Local Development
If S3 is not configured, files are stored in `uploads/` directory:
```
uploads/
├── kyc_document/
├── profile_image/
└── deposit_slip/
```

### Production Deployment
1. Configure all AWS environment variables
2. Ensure IAM user has correct permissions
3. Test file upload endpoints
4. Monitor S3 costs and usage

## Troubleshooting

### Common Issues

1. **"Missing required S3 environment variables"**
   - Check all AWS environment variables are set
   - Verify no typos in variable names

2. **"Access Denied" errors**
   - Verify IAM user permissions
   - Check bucket policy
   - Ensure correct region is set

3. **"File too large" errors**
   - Check file size limits in code
   - Verify client-side file size validation

4. **"Invalid file type" errors**
   - Check MIME type validation
   - Ensure file extensions match content

### Monitoring
- Check CloudWatch for S3 API calls
- Monitor application logs for upload errors
- Track file upload success rates
- Monitor S3 storage costs

## Security Best Practices

1. **Never make S3 bucket public**
2. **Use signed URLs for file access**
3. **Implement virus scanning**
4. **Regular security audits**
5. **Monitor unusual upload patterns**
6. **Implement file retention policies**
7. **Use S3 encryption at rest**
8. **Enable S3 access logging**

## Cost Optimization

1. **Use S3 Intelligent Tiering**
2. **Implement lifecycle policies**
3. **Monitor and alert on costs**
4. **Compress images before upload**
5. **Delete unused files regularly**
