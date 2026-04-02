// MSG91 Widget Configuration (No Supabase needed!)
declare global {
  interface Window {
    initSendOTP: (config: any) => any;
    sendOtp: (identifier?: string) => Promise<any>;
    verifyOtp: (otp: string) => Promise<any>;
    retryOtp: (type: string) => Promise<any>;
  }
}

const WIDGET_ID = "3663446a725a363934363033";
const TOKEN_AUTH = "495150T9dnXSDMY69a09988P1";

let widgetInstance: any = null;

/**
 * Load MSG91 OTP Widget Script
 */
const loadMsg91Script = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.initSendOTP) {
      resolve();
      return;
    }

    const urls = [
      'https://verify.msg91.com/otp-provider.js',
      'https://verify.phone91.com/otp-provider.js'
    ];

    let i = 0;

    function attempt() {
      const script = document.createElement('script');
      script.src = urls[i];
      script.async = true;

      script.onload = () => {
        if (typeof window.initSendOTP === 'function') {
          resolve();
        }
      };

      script.onerror = () => {
        i++;
        if (i < urls.length) {
          attempt();
        } else {
          reject(new Error('Failed to load MSG91 widget'));
        }
      };

      document.head.appendChild(script);
    }

    attempt();
  });
};

/**
 * Initialize MSG91 Widget with phone number
 */
export const initWidget = async (phoneNumber: string): Promise<void> => {
  try {
    // Load script if not already loaded
    await loadMsg91Script();

    // Initialize widget with configuration
    widgetInstance = window.initSendOTP({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      identifier: phoneNumber,
      exposeMethods: true, // Expose sendOtp, verifyOtp methods
      success: (data: any) => {
        console.log('MSG91 Widget Success:', data);
      },
      failure: (error: any) => {
        console.error('MSG91 Widget Failure:', error);
      }
    });

    console.log('MSG91 Widget initialized successfully');
  } catch (error) {
    console.error('Error initializing MSG91 widget:', error);
    throw error;
  }
};

/**
 * Send OTP using MSG91 Widget
 */
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Initialize widget first
    await initWidget(phoneNumber);

    // Wait a bit for widget to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send OTP with phone number
    if (window.sendOtp) {
      // Try calling with identifier parameter
      const result = await window.sendOtp();
      console.log('OTP sent:', result);

      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } else {
      throw new Error('MSG91 widget not properly initialized');
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Verify OTP using MSG91 Widget
 */
export const verifyOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Make sure widget is initialized
    if (!window.verifyOtp) {
      await initWidget(phoneNumber);
    }

    // Verify OTP
    if (window.verifyOtp) {
      const result = await window.verifyOtp(otp);
      console.log('OTP verified:', result);

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      throw new Error('MSG91 widget not properly initialized');
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error(error.message || 'Invalid OTP');
  }
};

/**
 * Resend OTP using MSG91 Widget
 */
export const resendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Make sure widget is initialized
    if (!window.retryOtp) {
      await initWidget(phoneNumber);
    }

    // Resend OTP (voice or text)
    if (window.retryOtp) {
      const result = await window.retryOtp('text'); // 'text' or 'voice'
      console.log('OTP resent:', result);

      return {
        success: true,
        message: 'OTP resent successfully'
      };
    } else {
      throw new Error('MSG91 widget not properly initialized');
    }
  } catch (error: any) {
    console.error('Error resending OTP:', error);
    throw new Error(error.message || 'Failed to resend OTP');
  }
};
