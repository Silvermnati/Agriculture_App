# M-Pesa Integration Setup Guide

## Overview
This guide will help you set up M-Pesa STK Push integration for your agricultural app. The integration allows users to make payments directly from their mobile phones using M-Pesa.

## Prerequisites
1. M-Pesa Developer Account
2. Safaricom Developer Portal Access
3. Valid Kenyan Business Registration (for production)

## Step 1: Create M-Pesa Developer Account

### For Sandbox (Testing)
1. Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Sign up for a developer account
3. Verify your email address
4. Log in to the developer portal

### Create a New App
1. Go to "My Apps" section
2. Click "Create New App"
3. Fill in the app details:
   - App Name: "Agricultural Super App"
   - Description: "Agricultural consultation and payment platform"
4. Select the APIs you need:
   - **M-Pesa Express (STK Push)** - Required for payments
   - **M-Pesa Express Query** - Required for checking payment status

## Step 2: Get Your Credentials

After creating your app, you'll get:

### Sandbox Credentials
- **Consumer Key**: Used for authentication
- **Consumer Secret**: Used for authentication
- **Business Short Code**: Usually `174379` for sandbox
- **Passkey**: Used for generating passwords

### Test Credentials (Sandbox)
```
Business Short Code: 174379
Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

## Step 3: Update Environment Variables

Update your `.env` file with the M-Pesa credentials:

```env
# M-Pesa Configuration
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_actual_consumer_key_here
MPESA_CONSUMER_SECRET=your_actual_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://agriculture-app-1-u2a6.onrender.com/api/payments/callback
```

## Step 4: Test Your Configuration

### Using the Test Endpoint
1. Start your server
2. Make a GET request to: `https://agriculture-app-1-u2a6.onrender.com/api/payments/test-config`
3. Check the response for configuration status

### Expected Response
```json
{
  "success": true,
  "config_status": {
    "environment": "sandbox",
    "business_short_code": "174379",
    "callback_url": "https://agriculture-app-1-u2a6.onrender.com/api/payments/callback",
    "has_consumer_key": true,
    "has_consumer_secret": true,
    "has_passkey": true,
    "access_token_test": "SUCCESS",
    "has_access_token": true
  }
}
```

## Step 5: Test STK Push

### Test Phone Numbers (Sandbox)
Use these test phone numbers for sandbox testing:
- `254708374149`
- `254711111111`
- `254722000000`

### Test Payment Flow
1. Open your app
2. Navigate to a payment screen (e.g., expert consultation)
3. Enter a test phone number
4. Click "Pay Now"
5. Check the browser console for logs
6. The sandbox will simulate the payment process

## Step 6: Handle Common Issues

### Issue 1: "Missing Credentials" Error
**Solution**: Ensure all environment variables are set correctly in your `.env` file and restart your server.

### Issue 2: "Token Error" 
**Solution**: Check your Consumer Key and Consumer Secret. Make sure they're copied correctly from the developer portal.

### Issue 3: "Invalid Phone Number"
**Solution**: Use the correct format:
- Start with `254` (Kenya country code)
- Or start with `0` (will be converted to `254`)
- Must be 12 digits total (including country code)

### Issue 4: "STK Push Failed"
**Solution**: 
- Check if the phone number is registered for M-Pesa
- Ensure the amount is within limits (KES 1 - 150,000)
- Verify your Business Short Code and Passkey

## Step 7: Production Setup

### For Production Environment
1. Apply for M-Pesa Go-Live
2. Provide required business documents
3. Get production credentials
4. Update environment variables:
   ```env
   MPESA_ENVIRONMENT=production
   MPESA_CONSUMER_KEY=your_production_consumer_key
   MPESA_CONSUMER_SECRET=your_production_consumer_secret
   MPESA_BUSINESS_SHORT_CODE=your_actual_business_shortcode
   MPESA_PASSKEY=your_production_passkey
   ```

## Step 8: Callback URL Setup

### Important Notes
- Your callback URL must be publicly accessible
- It should use HTTPS (required by Safaricom)
- The endpoint should return HTTP 200 status
- Current callback URL: `https://agriculture-app-1-u2a6.onrender.com/api/payments/callback`

### Callback URL Validation
Safaricom will validate your callback URL during app creation. Make sure:
1. Your server is running
2. The callback endpoint is accessible
3. It returns a proper response

## Troubleshooting

### Debug Steps
1. Check server logs for detailed error messages
2. Use the test configuration endpoint
3. Verify all environment variables are set
4. Test with sandbox phone numbers first
5. Check network connectivity

### Common Error Codes
- `1001`: Insufficient funds
- `1032`: Request cancelled by user
- `1037`: Timeout (user didn't enter PIN)
- `2001`: Invalid phone number
- `9999`: Request failed

### Getting Help
1. Check Safaricom Developer Documentation
2. Contact Safaricom Developer Support
3. Review server logs for detailed error messages
4. Use the browser console to check frontend errors

## Security Best Practices

1. **Never expose credentials**: Keep your Consumer Key and Secret secure
2. **Use HTTPS**: Always use secure connections
3. **Validate callbacks**: Verify callback requests are from Safaricom
4. **Log transactions**: Keep detailed logs for debugging and auditing
5. **Handle timeouts**: Implement proper timeout handling
6. **Validate amounts**: Ensure payment amounts are within acceptable limits

## Next Steps

After successful setup:
1. Test thoroughly with sandbox
2. Implement proper error handling
3. Add payment confirmation emails/SMS
4. Set up monitoring and alerts
5. Plan for production deployment

---

**Note**: This integration is specifically designed for Kenyan M-Pesa. For other countries, you'll need different payment providers.