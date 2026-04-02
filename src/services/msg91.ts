import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    initSendOTP: (config: any) => any;
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const MSG91_WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID as string;
const MSG91_TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH as string;

interface Msg91WidgetSuccessPayload {
  accessToken?: string;
  access_token?: string;
  token?: string;
  jwt?: string;
  ['access-token']?: string;
}

interface Msg91User {
  id: string;
  phone: string;
}

export interface Msg91AuthResponse {
  access_token?: string;
  refresh_token?: string;
  user?: Msg91User;
}

const normalizePhoneNumber = (phone: string): string => phone.replace(/\D/g, '').slice(0, 10);

const parseWidgetAccessToken = (payload: any): string => {
  if (typeof payload === 'string' && payload.length > 0) return payload;

  if (payload && typeof payload === 'object') {
    return (
      payload.accessToken ||
      payload.access_token ||
      payload['access-token'] ||
      payload.token ||
      payload.jwt ||
      payload.message ||
      ''
    );
  }

  return '';
};

const waitForWidgetApi = async (timeoutMs = 8000): Promise<void> => {
  const start = Date.now();
  while (typeof window.initSendOTP !== 'function') {
    if (Date.now() - start > timeoutMs) {
      throw new Error('MSG91 widget script not loaded');
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
};

const waitForWidgetAccessToken = async (phone: string): Promise<string> => {
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    throw new Error(
      'OTP cannot be tested on localhost with MSG91. Please open the app on an allowed public URL (for example ngrok) and whitelist that domain in MSG91 widget settings.'
    );
  }

  await waitForWidgetApi();

  return new Promise((resolve, reject) => {
    const identifier = `91${phone}`;
    let settled = false;

    const timeout = setTimeout(() => {
      reject(new Error('OTP widget timed out. Please try again.'));
    }, 180000);

    const done = (token: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(token);
    };

    const fail = (msg: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      const rawMessage = msg || 'OTP verification failed';
      const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const isCaptchaTokenError = /invalid captcha token/i.test(rawMessage);
      const isLocalhostHostError = /localhost detected|valid host/i.test(rawMessage);
      const isIpBlocked = /ipblocked|ip blocked/i.test(rawMessage);

      if (isLocalhost && (isCaptchaTokenError || isLocalhostHostError)) {
        reject(
          new Error(
            'MSG91 CAPTCHA does not work reliably on localhost. Please test OTP on an allowed public URL (for example ngrok) and add that domain in MSG91 widget settings.'
          )
        );
        return;
      }

      if (isIpBlocked) {
        reject(
          new Error(
            `MSG91 blocked this request source (IP/domain). Please whitelist "${window.location.hostname}" and your current public IP in MSG91 widget security settings, then try again.`
          )
        );
        return;
      }

      reject(new Error(rawMessage));
    };

    try {
      window.initSendOTP({
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_TOKEN_AUTH,
        identifier,
        success: (data: Msg91WidgetSuccessPayload) => {
          const accessToken = parseWidgetAccessToken(data || {});
          if (!accessToken) { fail('MSG91 did not return a valid access token'); return; }
          done(accessToken);
        },
        failure: (error: { message?: string }) => {
          fail(error?.message || 'OTP verification failed');
        },
      });
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Failed to initialize MSG91 widget');
    }
  });
};

export const sendOtp = async (phone: string): Promise<void> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/msg91-auth-web`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ action: 'send', phone }),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'Failed to send OTP');
};

export const verifyOtp = async (
  phone: string,
  otp: string
): Promise<{ access_token: string; refresh_token: string; user: Msg91User }> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/msg91-auth-web`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ action: 'verify', phone, otp }),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'OTP verification failed');
  return data;
};

export const exchangeMsg91Token = async (
  msg91AccessToken: string,
  phone: string
): Promise<Msg91AuthResponse> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/msg91-auth-web`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ msg91_access_token: msg91AccessToken, phone }),
  });

  const data = (await response.json()) as Msg91AuthResponse & { error?: string; details?: string };
  if (!response.ok || data.error) {
    throw new Error(data.error || data.details || 'Authentication failed');
  }

  return data;
};

export const authenticateWithMsg91Widget = async (
  rawPhoneNumber: string
): Promise<{ user: Msg91User | null }> => {
  const phone = normalizePhoneNumber(rawPhoneNumber);
  if (phone.length !== 10) {
    throw new Error('Please enter a valid 10-digit phone number');
  }

  const msg91AccessToken = await waitForWidgetAccessToken(phone);
  const authResponse = await exchangeMsg91Token(msg91AccessToken, phone);

  if (!authResponse.access_token || !authResponse.refresh_token) {
    throw new Error('Missing session tokens from authentication response');
  }

  const { error } = await supabase.auth.setSession({
    access_token: authResponse.access_token,
    refresh_token: authResponse.refresh_token,
  });
  if (error) {
    throw new Error(error.message || 'Failed to establish Supabase session');
  }

  return { user: authResponse.user || null };
};
