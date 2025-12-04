# Africa's Talking Setup Guide

This guide will help you set up Africa's Talking for USSD and SMS services.

## Step 1: Create Account

1. Go to https://africastalking.com
2. Click "Sign Up" or "Get Started"
3. Fill in your details and verify your email
4. Complete the registration process

## Step 2: Get API Credentials

1. Log in to your dashboard: https://account.africastalking.com
2. Navigate to **Settings** → **API** → **API Key**
3. You'll see:
   - **Username**: Your API username
   - **API Key**: Your API key (click "Show" to reveal)
4. Copy both values - you'll need them for your `.env` file

## Step 3: Set Up USSD Service

1. In the dashboard, go to **USSD** → **Services**
2. Click **Create USSD Service**
3. Fill in:
   - **Service Name**: Safro Escrow
   - **Short Code**: `*XYZ#` (or your preferred code)
   - **Callback URL**: `https://your-domain.com/api/ussd/webhook`
   - **HTTP Method**: POST
4. Click **Create**
5. Note: You may need to submit for approval depending on your country

## Step 4: Set Up SMS

1. Go to **SMS** → **Settings**
2. Set up your **Sender ID**:
   - **Sender ID**: `SAFRO` (or your preferred name)
   - Note: Sender ID may need approval in some countries
3. For testing, you can use the sandbox environment

## Step 5: Configure Your Environment

Add these to your `.env` file:

```env
AFRICASTALKING_API_KEY=your_actual_api_key_here
AFRICASTALKING_USERNAME=your_actual_username_here
AFRICASTALKING_SMS_SENDER_ID=SAFRO
AFRICASTALKING_USSD_SHORT_CODE=*XYZ#
```

## Step 6: Test Your Setup

### Test SMS

You can test SMS sending using the API:

```bash
curl -X POST http://localhost:3001/api/notification/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone_number": "+254712345678",
    "message": "Test message from Safro"
  }'
```

### Test USSD

1. Dial your USSD code: `*XYZ#`
2. You should see the main menu
3. Navigate through the options

## Important Notes

1. **Sandbox vs Production**:
   - Start with sandbox for testing
   - Sandbox has limitations (e.g., can only send to verified numbers)
   - Move to production when ready

2. **Approval Process**:
   - USSD short codes need approval (varies by country)
   - Sender IDs may need approval
   - Contact support if you need help

3. **Pricing**:
   - Check pricing at: https://africastalking.com/pricing
   - SMS: Usually per message
   - USSD: Usually per session

4. **Webhook Security**:
   - Africa's Talking can send IP whitelist
   - Consider adding authentication to your webhook endpoint
   - Verify webhook signatures if available

5. **Country Support**:
   - Africa's Talking supports multiple African countries
   - Check which countries are available
   - Some features may vary by country

## Support

- Documentation: https://developers.africastalking.com
- Support: support@africastalking.com
- Status: https://status.africastalking.com

## Troubleshooting

### SMS Not Sending
- Check API key and username are correct
- Verify sender ID is approved
- Check account balance
- Review error logs

### USSD Not Working
- Verify callback URL is accessible
- Check webhook endpoint is receiving requests
- Ensure short code is approved
- Test with sandbox first

### Authentication Errors
- Double-check API credentials
- Ensure no extra spaces in `.env` file
- Verify account is active

