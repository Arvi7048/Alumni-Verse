# Email OTP Authentication Setup

This document explains how to set up and use the email OTP-based authentication system in the Alumni Platform.

## Features Implemented

✅ **Email OTP Registration** - Users can register with email verification via OTP  
✅ **Email OTP Forgot Password** - Password reset using email OTP verification  
✅ **Change Password** - Authenticated users can change their password  
✅ **Resend OTP** - Users can request new OTP codes with cooldown protection  
✅ **OTP Expiration** - OTPs expire after 10 minutes for security  
✅ **Rate Limiting** - Maximum 3 attempts per OTP to prevent abuse  

## Backend Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file in the backend directory:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Existing variables (keep these)
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
PORT=5000
```

### 2. Email Service Setup (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS` environment variable

### 3. Alternative Email Services

You can use other email services by changing the `EMAIL_SERVICE` variable:

```env
# For Outlook/Hotmail
EMAIL_SERVICE=hotmail

# For Yahoo
EMAIL_SERVICE=yahoo

# For custom SMTP
EMAIL_SERVICE=custom
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_SECURE=false
```

## API Endpoints

### Registration with OTP
```
POST /api/otp-auth/send-registration-otp
POST /api/otp-auth/verify-registration-otp
```

### Forgot Password with OTP
```
POST /api/otp-auth/forgot-password
POST /api/otp-auth/reset-password
```

### Change Password (Authenticated)
```
POST /api/otp-auth/change-password
```

### Utility
```
POST /api/otp-auth/resend-otp
```

## Frontend Routes

- `/otp-signup` - OTP-based registration
- `/otp-forgot-password` - OTP-based password reset
- `/change-password` - Change password (protected route)

## Database Models

### OTP Model
- Stores OTP codes with expiration and attempt tracking
- Automatically cleans up expired OTPs
- Supports different OTP types (registration, forgot_password, email_verification)

### User Model Updates
- Added `isEmailVerified` field
- Added `emailVerificationToken` field for future email verification features

## Usage Flow

### Registration Flow
1. User enters registration details on `/otp-signup`
2. System sends OTP to user's email
3. User enters OTP to verify and complete registration
4. Account is created with `isEmailVerified: true`

### Forgot Password Flow
1. User enters email on `/otp-forgot-password`
2. System sends OTP to user's email
3. User enters OTP to verify identity
4. User sets new password
5. Password is updated in database

### Change Password Flow
1. Authenticated user goes to `/change-password`
2. User enters current password and new password
3. System verifies current password
4. Password is updated if verification succeeds

## Security Features

- **OTP Expiration**: 10 minutes
- **Attempt Limiting**: Maximum 3 attempts per OTP
- **Cooldown Protection**: 60-second cooldown between OTP requests
- **Password Validation**: Minimum 6 characters
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs

## Testing

### Manual Testing Steps

1. **Test Registration**:
   - Navigate to `/otp-signup`
   - Fill registration form
   - Check email for OTP
   - Enter OTP to complete registration

2. **Test Forgot Password**:
   - Navigate to `/otp-forgot-password`
   - Enter registered email
   - Check email for OTP
   - Enter OTP and set new password

3. **Test Change Password**:
   - Login to account
   - Navigate to `/change-password`
   - Enter current and new password
   - Verify password change

### Troubleshooting

**OTP not received?**
- Check spam/junk folder
- Verify email configuration
- Check server logs for email sending errors

**OTP expired?**
- Request a new OTP (60-second cooldown)
- OTPs are valid for 10 minutes only

**Too many attempts?**
- Wait for cooldown period
- Request a new OTP after cooldown

## Production Considerations

1. **Email Service**: Use a professional email service (SendGrid, AWS SES, etc.)
2. **Rate Limiting**: Implement additional rate limiting at the API gateway level
3. **Monitoring**: Monitor OTP success/failure rates
4. **Backup**: Implement backup authentication methods
5. **Compliance**: Ensure GDPR/privacy compliance for email handling

## Integration with Existing System

The OTP authentication system works alongside the existing authentication:
- Original `/signup` and `/login` routes remain functional
- New OTP routes provide enhanced security options
- Users can choose between regular and OTP-based registration
- Existing users can use the change password feature

## Future Enhancements

- Email verification for existing users
- SMS OTP as alternative to email
- Multi-factor authentication (MFA)
- Social login integration with email verification
- Admin panel for OTP management and monitoring
