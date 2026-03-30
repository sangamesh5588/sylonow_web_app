# Authentication Setup Guide

## OTP-Based Login with MSG91

This application uses MSG91 for OTP-based authentication. Users can login using their phone number only (no email required).

## Setup Instructions

### 1. Create MSG91 Account

1. Go to [MSG91](https://msg91.com/)
2. Sign up for a new account
3. Verify your account

### 2. Get API Credentials

1. Login to your MSG91 dashboard
2. Navigate to **API** section
3. Copy your **Auth Key**
4. Go to **OTP** section and create a new OTP template
5. Note down your **Template ID**
6. (Optional) Set a **Sender ID** for your SMS

### 3. Configure Environment Variables

Open the `.env.local` file in the root directory and update with your credentials:

```env
VITE_MSG91_AUTH_KEY=your_actual_auth_key_here
VITE_MSG91_TEMPLATE_ID=your_actual_template_id_here
VITE_MSG91_SENDER_ID=your_sender_id_here
```

**Important:** Never commit `.env.local` to version control!

### 4. MSG91 OTP Template Setup

Create an OTP template in MSG91 with the following format:

```
Your OTP for Sylonow login is {OTP}. Valid for 10 minutes. Do not share with anyone.
```

Make sure to use `{OTP}` as the placeholder for the OTP code.

## How It Works

### User Flow

1. **Phone Number Entry**
   - User enters their 10-digit phone number
   - System validates the number format

2. **OTP Generation**
   - Click "Send OTP"
   - MSG91 sends a 6-digit OTP to the phone number
   - 30-second countdown before resend option appears

3. **OTP Verification**
   - User enters the received OTP
   - System verifies with MSG91
   - If valid, proceed to name entry

4. **Name Entry**
   - User enters their full name
   - System completes the login
   - User info stored in localStorage

5. **Authenticated Access**
   - User can now add items to cart
   - User can proceed to checkout
   - User info displayed in navbar

### Authentication Logic

- **Add to Cart**: Requires login
- **Checkout**: Requires login (redirects if not authenticated)
- **User Session**: Stored in localStorage (persists across browser sessions)

## Files Created

### Core Authentication Files

1. **`.env.local`**
   - Environment variables for MSG91 configuration

2. **`src/services/msg91.ts`**
   - MSG91 API integration
   - Functions: `sendOTP()`, `verifyOTP()`, `resendOTP()`

3. **`src/contexts/AuthContext.tsx`**
   - Authentication state management
   - User session handling
   - Login/logout functionality

4. **`src/components/LoginModal.tsx`**
   - Multi-step login UI
   - Phone entry, OTP verification, name entry
   - Countdown timer and resend functionality

### Modified Files

1. **`src/App.tsx`**
   - Wrapped with `AuthProvider`
   - Added `LoginModal` component

2. **`src/components/layout/Navbar.tsx`**
   - Shows user info when logged in
   - Login button triggers modal
   - Uses `useAuth()` hook

3. **`src/pages/ServiceDetail.tsx`**
   - Authentication check before add to cart
   - Shows login modal if not authenticated

4. **`src/pages/Checkout.tsx`**
   - Authentication guard
   - Redirects to home if not logged in

## Usage Examples

### Check if User is Authenticated

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <p>Welcome {user?.name}!</p>;
  }

  return <p>Please login</p>;
}
```

### Show Login Modal

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { setShowLoginModal } = useAuth();

  return (
    <button onClick={() => setShowLoginModal(true)}>
      Login
    </button>
  );
}
```

### Logout User

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## Testing

### Test Mode (Without MSG91)

If you want to test without MSG91 (for development), you can modify `src/services/msg91.ts` to return mock responses:

```typescript
// Mock mode - for testing only
export const sendOTP = async (phoneNumber: string): Promise<SendOTPResponse> => {
  return { type: 'success', message: 'OTP sent successfully' };
};

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<VerifyOTPResponse> => {
  if (otp === '123456') { // Accept any 6-digit OTP in test mode
    return { type: 'success', message: 'OTP verified successfully' };
  }
  throw new Error('Invalid OTP');
};
```

## Security Considerations

1. **Never expose API keys**: Keep `.env.local` in `.gitignore`
2. **Validate on backend**: This is frontend-only authentication for demo purposes
3. **Add backend validation**: For production, always verify OTP on your backend server
4. **Rate limiting**: Implement rate limiting to prevent OTP spam
5. **Session management**: Consider adding JWT tokens for better security

## Troubleshooting

### OTP not received

- Check if phone number is correct (must be 10 digits)
- Verify MSG91 account has credits
- Check MSG91 dashboard for delivery status
- Ensure template ID is correct

### "Failed to send OTP" error

- Verify `VITE_MSG91_AUTH_KEY` is correct
- Check MSG91 account status
- Ensure you have sufficient credits

### "Invalid OTP" error

- Check if OTP has expired (usually 10 minutes)
- Verify entered OTP matches the received one
- Try resending OTP

## Production Checklist

- [ ] Add backend API for OTP verification
- [ ] Implement JWT token authentication
- [ ] Add rate limiting for OTP requests
- [ ] Set up proper session management
- [ ] Add logout functionality in profile page
- [ ] Implement "Remember me" option
- [ ] Add phone number verification indicator
- [ ] Set up error logging and monitoring

## Support

For MSG91 support: https://msg91.com/help
For issues with this implementation: Check the code comments or contact the development team
