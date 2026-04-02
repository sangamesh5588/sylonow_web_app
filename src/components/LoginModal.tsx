import { useState, useRef, useEffect } from 'react';
import { X, Check, ArrowLeft, Phone, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { sendOtp, verifyOtp } from '../services/msg91';

export const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, refreshProfile } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  if (!showLoginModal) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true);
    setError('');
    try {
      await sendOtp(phoneNumber);
      setStep('otp');
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      pasted.split('').forEach((d, i) => { if (i < 4) newOtp[i] = d; });
      setOtp(newOtp);
      otpRefs.current[Math.min(pasted.length, 3)]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 4) { setError('Enter the 4-digit OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const { access_token, refresh_token, user } = await verifyOtp(phoneNumber, otpValue);
      await supabase.auth.setSession({ access_token, refresh_token });

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profileData?.full_name) {
        await refreshProfile();
        resetModal();
      } else {
        setStep('name');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendLoading(true);
    setError('');
    try {
      await sendOtp(phoneNumber);
      setOtp(['', '', '', '']);
      startResendTimer();
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCompleteName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').upsert(
          { auth_user_id: user.id, full_name: name.trim(), phone_number: `+91${phoneNumber}`, app_type: 'customer' },
          { onConflict: 'auth_user_id' }
        );
        await refreshProfile();
      }
      resetModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save name.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp(['', '', '', '']);
    setName('');
    setError('');
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    setShowLoginModal(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 relative overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#FB2965] to-[#e02456] px-6 py-5 text-white">
          <button onClick={resetModal} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X size={22} />
          </button>
          {step === 'otp' && (
            <button onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={22} />
            </button>
          )}
          <div className="text-center">
            <h2
              className="text-[1.55rem] leading-none text-white"
              style={{ fontFamily: '"Para", serif', fontWeight: 600 }}
            >
              Sylonow
            </h2>
            <p className="mt-1 text-sm text-white">
              {step === 'phone' && 'Login to continue'}
              {step === 'otp' && 'Verify your number'}
              {step === 'name' && 'Almost there!'}
            </p>
          </div>
        </div>

        <div className="px-6 py-6">

          {/* STEP 1: Phone */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 bg-[#FB2965]/10 rounded-full flex items-center justify-center">
                  <Phone size={26} className="text-[#FB2965]" />
                </div>
              </div>
              <div>
                <p className="text-center text-sm text-gray-500 mb-4">
                  We&apos;ll send a 4-digit OTP to verify your number
                </p>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#FB2965]/30 focus-within:border-[#FB2965]">
                  <span className="px-3 py-3.5 bg-gray-50 text-sm font-semibold text-gray-600 border-r border-gray-200">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-4 py-3.5 text-sm focus:outline-none"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full py-3.5 bg-[#FB2965] text-white font-semibold rounded-xl hover:bg-[#e02456] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-gray-500">OTP sent to</p>
                <p className="font-semibold text-gray-800">+91 {phoneNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Enter 4-digit OTP</label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-12 text-center text-lg font-bold border rounded-xl focus:outline-none transition-all
                        ${digit ? 'border-[#FB2965] bg-[#FB2965]/5 text-[#FB2965]' : 'border-gray-200 text-gray-800'}
                        focus:border-[#FB2965] focus:ring-2 focus:ring-[#FB2965]/20`}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 4}
                className="w-full py-3.5 bg-[#FB2965] text-white font-semibold rounded-xl hover:bg-[#e02456] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-400">Resend OTP in <span className="font-semibold text-[#FB2965]">{resendTimer}s</span></p>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resendLoading}
                    className="text-sm text-[#FB2965] font-semibold flex items-center gap-1 mx-auto hover:underline disabled:opacity-50">
                    <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                    {resendLoading ? 'Resending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: Name */}
          {step === 'name' && (
            <form onSubmit={handleCompleteName} className="space-y-5">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Check size={28} className="text-green-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Phone verified! What should we call you?</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB2965]/20 focus:border-[#FB2965] text-sm"
                  autoFocus
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3.5 bg-[#FB2965] text-white font-semibold rounded-xl hover:bg-[#e02456] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400 text-center mt-5">
            By continuing, you agree to Sylonow's Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
