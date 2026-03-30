const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Send OTP to phone number using Supabase Edge Function
 */
export const sendOTP = async (phoneNumber: string): Promise<SendOTPResponse> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP sent to phone number using Supabase Edge Function
 */
export const verifyOTP = async (phoneNumber: string, otp: string): Promise<VerifyOTPResponse> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phoneNumber, otp }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Invalid OTP');
    }

    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Resend OTP to phone number using Supabase Edge Function
 */
export const resendOTP = async (phoneNumber: string): Promise<SendOTPResponse> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to resend OTP');
    }

    return data;
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};
