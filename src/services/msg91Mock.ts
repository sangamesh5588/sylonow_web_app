/**
 * Mock MSG91 for Development/Testing
 * Use this while debugging the actual MSG91 widget
 */

// Development OTP - will work for testing
const DEV_OTP = '1234';

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  console.log('🧪 DEV MODE: Sending mock OTP to', phoneNumber);
  console.log(`🔑 Use OTP: ${DEV_OTP}`);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    message: 'OTP sent successfully (DEV MODE)'
  };
};

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> => {
  console.log('🧪 DEV MODE: Verifying OTP', otp, 'for', phoneNumber);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (otp === DEV_OTP) {
    return {
      success: true,
      message: 'OTP verified successfully (DEV MODE)'
    };
  } else {
    throw new Error(`Invalid OTP. Use ${DEV_OTP} for testing`);
  }
};

export const resendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  console.log('🧪 DEV MODE: Resending mock OTP to', phoneNumber);
  console.log(`🔑 Use OTP: ${DEV_OTP}`);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    message: 'OTP resent successfully (DEV MODE)'
  };
};
