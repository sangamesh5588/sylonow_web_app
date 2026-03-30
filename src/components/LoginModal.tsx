import { useState } from 'react';
import { X, Phone, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// TEMPORARY: Using mock for testing. Use OTP: 123456
import { sendOTP, verifyOTP, resendOTP } from '../services/msg91Mock';

export const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);

  if (!showLoginModal) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendOTP(phoneNumber);
      setStep('otp');
      startCountdown();
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 4 && otp.length !== 6) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOTP(phoneNumber, otp);
      const storedUser = localStorage.getItem('sylonow_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const savedName = parsedUser?.phoneNumber === phoneNumber ? parsedUser?.name : '';

      if (savedName) {
        login(phoneNumber, savedName);
        resetModal();
        return;
      }

      setStep('name');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteName = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    login(phoneNumber, name);
    resetModal();
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await resendOTP(phoneNumber);
      setCanResend(false);
      startCountdown();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(30);
    setCanResend(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setName('');
    setError('');
    setShowLoginModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={resetModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#FB2965]">Sylonow</h2>
          <p className="text-sm text-gray-500 mt-1">Login to continue</p>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 px-3 py-3 bg-gray-50 rounded-lg">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB2965]/20"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className="w-full py-3 bg-[#FB2965] text-white font-semibold rounded-lg hover:bg-[#e02456] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter OTP
              </label>
              <p className="text-sm text-gray-500 mb-3">
                OTP sent to +91 {phoneNumber}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FB2965]/20"
                disabled={loading}
                maxLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="text-center text-sm">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-[#FB2965] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-500">
                  Resend OTP in {countdown}s
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-3 bg-[#FB2965] text-white font-semibold rounded-lg hover:bg-[#e02456] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Change phone number
            </button>
          </form>
        )}

        {/* Name Step */}
        {step === 'name' && (
          <form onSubmit={handleCompleteName} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your name?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB2965]/20"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 bg-[#FB2965] text-white font-semibold rounded-lg hover:bg-[#e02456] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Login
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to Sylonow's Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};
