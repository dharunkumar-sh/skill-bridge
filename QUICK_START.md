# Payment Gateway - Quick Start Guide

## 5-Minute Setup

### Step 1: Get Stripe Account (5 min)

1. Go to https://stripe.com
2. Sign up for free account
3. Go to Developers → API Keys
4. Copy your keys:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

### Step 2: Configure Environment (2 min)

Create/update `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=
```

`STRIPE_WEBHOOK_SECRET` is generated from webhook setup (or Stripe CLI) and is optional for local checkout testing.

### Step 3: Apply Database Changes (1 min)

```bash
npm run db:push
```

### Step 4: Test Payment (2 min)

1. Start dev server: `npm run dev`
2. Go to Dashboard → Settings
3. Click "Upgrade to Professional"
4. Use test card: `4242 4242 4242 4242`
5. Any future date, any 3-digit CVC

## Testing Checklist

- [ ] Stripe keys in `.env.local`
- [ ] Database schema updated
- [ ] Can open checkout modal from Sidebar
- [ ] Card form displays in modal
- [ ] Test payment succeeds
- [ ] Subscription updates in user record
- [ ] User plan now shows "professional"

## File Structure

```
Payment Gateway Files:
├── components/
│   ├── CheckoutModal.tsx          (Payment form)
│   └── StripeProvider.tsx         (Stripe wrapper)
├── app/api/payment/
│   ├── create-checkout-session/
│   ├── confirm-payment/
│   ├── webhook/
│   └── user/subscription/
├── src/db/schema.ts               (Updated)
├── context/AuthContext.tsx        (Updated)
├── PAYMENT_SETUP.md              (Full docs)
└── IMPLEMENTATION_SUMMARY.md     (Overview)
```

## Pricing Plans

```
Free     - ₹0       - 50+ courses
Prof     - ₹2,999   - 1-on-1 mentoring
Premium  - ₹4,999   - Unlimited support
```

## Test Cards

| Type      | Card                | Result        |
| --------- | ------------------- | ------------- |
| Success   | 4242 4242 4242 4242 | Succeeds ✓    |
| Decline   | 4000 0000 0000 0002 | Declines ✗    |
| 3D Secure | 4000 0025 0000 3155 | Requires auth |

Any future date and any 3-digit CVC.

## Upgrade Button Locations

Users can upgrade from:

1. **Sidebar** - "Upgrade Now" card (always visible for free users)
2. **Settings → Billing** - "Upgrade to Professional" button
3. **Settings → Available Plans** - "Select Plan" buttons

## Flow Summary

```
1. User clicks upgrade button
2. CheckoutModal opens
3. User enters card details
4. Payment processed via Stripe
5. Subscription created
6. User data updated with new plan
7. User sees confirmation
```

## Common Commands

```bash
# Start development server
npm run dev

# Update database schema
npm run db:push

# View Stripe logs
stripe logs tail

# Listen for webhooks locally
stripe listen --forward-to localhost:3000/api/payment/webhook
```

## Troubleshooting

### Button not working?

- Check StripeProvider is in layout
- Verify CheckoutModal component loads
- Check browser console for errors

### Payment fails?

- Verify STRIPE_SECRET_KEY is correct
- Check database connection
- Review server logs

### Subscription not updating?

- Confirm database schema was applied
- Check user record exists before payment
- Verify PaymentIntent succeeded in Stripe dashboard

## Going to Production

1. ⚠️ Switch to LIVE Stripe keys
2. ⚠️ Configure HTTPS webhook URL
3. ⚠️ Set STRIPE_WEBHOOK_SECRET for production
4. ⚠️ Test with real payment method
5. ⚠️ Set up monitoring/alerts
6. ⚠️ Configure email notifications

## Key Resources

- 📖 Full Docs: `PAYMENT_SETUP.md`
- 📋 Implementation: `IMPLEMENTATION_SUMMARY.md`
- 🔗 Stripe Docs: https://stripe.com/docs
- 💬 Support: https://support.stripe.com

---

**Ready to accept payments! 🎉**
