# Payment Gateway Integration Setup Guide

## Overview

This guide documents the Stripe payment gateway integration for handling user subscriptions (Professional and Premium plans) in the SkillBridge application.

## What's Been Implemented

### 1. Database Schema Updates

- Added subscription fields to the `users` table:
  - `subscription_plan`: Free, Professional, or Premium
  - `stripe_customer_id`: Reference to Stripe customer
  - `stripe_subscription_id`: Reference to Stripe subscription
  - `subscription_status`: Active, inactive, canceled, or past_due
  - `subscription_start_date` & `subscription_end_date`

- Created new tables:
  - `payments`: Tracks payment transactions
  - `subscriptions`: Manages subscription records

### 2. Frontend Components

#### CheckoutModal.tsx

- Displays payment checkout form using Stripe Elements
- Collects card information securely
- Processes payment with error handling
- Shows success confirmation upon completion

#### StripeProvider.tsx

- Wraps the application with Stripe Elements
- Makes Stripe context available to all components

#### Updated Sidebar.tsx

- "Upgrade Now" button now opens CheckoutModal
- Only shows for users without active subscription
- Directs to Professional plan by default

### 3. API Endpoints

#### POST `/api/payment/create-checkout-session`

Creates a Stripe PaymentIntent for a new subscription.

**Request Body:**

```json
{
  "plan": "professional" | "premium",
  "userEmail": "user@example.com",
  "userId": "uuid"
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Pricing:**

- Professional: ₹2,999/mo
- Premium: ₹4,999/mo

#### POST `/api/payment/confirm-payment`

Confirms payment on the server and activates subscription.

**Request Body:**

```json
{
  "paymentIntentId": "pi_xxx",
  "clientSecret": "pi_xxx_secret_xxx"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment confirmed and subscription activated"
}
```

#### POST `/api/payment/webhook`

Stripe webhook endpoint for handling async payment events.

**Handled Events:**

- `payment_intent.succeeded`: Activates subscription
- `payment_intent.payment_failed`: Updates payment status
- `customer.subscription.deleted`: Cancels subscription
- `invoice.payment_failed`: Marks subscription as past_due

#### GET `/api/user/subscription`

Retrieves current user subscription status.

**Query Parameters:**

- `email`: User's email address

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "subscription_plan": "professional" | "premium" | "free",
    "subscription_status": "active" | "inactive" | "canceled" | "past_due",
    "subscription_start_date": "2024-01-01T00:00:00Z",
    "subscription_end_date": "2024-02-01T00:00:00Z"
  }
}
```

### 4. AuthContext Updates

Added subscription fields to User interface:

- `subscriptionPlan`: Current subscription level
- `stripeCustomerId`: Stripe customer reference
- `stripeSubscriptionId`: Stripe subscription reference
- `subscriptionStatus`: Current subscription status
- `subscriptionStartDate`: When subscription started
- `subscriptionEndDate`: When subscription ends

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=
```

`STRIPE_WEBHOOK_SECRET` is generated when you configure webhook delivery and is optional for local checkout testing.

## Setup Instructions

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in
3. Navigate to Developers → API Keys
4. Copy your publishable and secret keys

### 2. Configure Environment Variables

```bash
# In .env.local (development)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 3. Set Up Webhook (Production)

1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add an endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/payment/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the Signing Secret and add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Update Database Schema

Run migrations to apply schema changes:

```bash
npm run db:push
```

### 5. Test Payment Flow

**Test Card Numbers:**

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC will work.

## Usage Flow

### For Users

1. Click "Upgrade Now" button in sidebar
2. Select plan (defaults to Professional)
3. Modal opens with payment form
4. Enter card details
5. Submit payment
6. Receive confirmation
7. Subscription activated

### For Developers

1. User initiates checkout
2. `CheckoutModal` calls `/api/payment/create-checkout-session`
3. Server creates Stripe PaymentIntent
4. Client confirms payment with Stripe
5. Client calls `/api/payment/confirm-payment`
6. Server updates user subscription
7. Webhook confirms async event

## Key Features

✅ **Secure Payments**: Uses Stripe's secure payment processing
✅ **Automatic Billing**: 30-day subscription cycles
✅ **Async Webhooks**: Handles all payment events reliably
✅ **Error Handling**: Comprehensive error messages
✅ **User Feedback**: Real-time payment status updates
✅ **Database Integration**: Tracks all payments and subscriptions

## Pricing Structure

| Plan         | Price  | Cycle   | Features                                |
| ------------ | ------ | ------- | --------------------------------------- |
| Free         | ₹0     | N/A     | Basic access                            |
| Professional | ₹2,999 | 30 days | 1-on-1 mentoring, AI matching           |
| Premium      | ₹4,999 | 30 days | Unlimited mentoring, priority placement |

## Troubleshooting

### Payment fails with "Invalid API Key"

- Verify Stripe keys in `.env.local`
- Ensure keys are from the same Stripe account
- Test keys must start with `sk_test_` and `pk_test_`

### Webhook not triggering

- Verify webhook secret in `.env.local`
- Check webhook endpoint is accessible
- Verify events are selected in Stripe dashboard

### Subscription not activated

- Check database connection
- Verify user exists in database
- Check Stripe PaymentIntent status
- Review server logs for errors

## Database Queries

### Check user subscription status

```sql
SELECT id, email, subscription_plan, subscription_status, subscription_end_date
FROM users
WHERE id = 'user-uuid';
```

### View recent payments

```sql
SELECT user_id, amount, status, plan, created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;
```

### Check active subscriptions

```sql
SELECT u.email, s.plan, s.status, s.current_period_end
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active';
```

## Security Considerations

1. **Client Secret**: Only transmitted between client and backend
2. **PCI Compliance**: Card details never touch your servers
3. **API Keys**: Keep secret key secure, never expose in frontend
4. **Webhook Verification**: Always verify webhook signature
5. **HTTPS Only**: Webhooks must use HTTPS in production

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send confirmation emails on successful payment
2. **Invoice Generation**: Create downloadable invoices
3. **Subscription Management**: Allow users to upgrade/downgrade plans
4. **Cancellation Path**: Implement subscription cancellation UI
5. **Usage Tracking**: Implement usage limits per plan
6. **Analytics**: Track conversion and churn rates
7. **Customer Portal**: Stripe-hosted customer portal for self-service

## Support

For Stripe-specific issues, refer to:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
