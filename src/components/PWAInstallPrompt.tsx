import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const safari = /safari/i.test(ua) && !/chrome/i.test(ua);

    if (ios && safari) {
      // Show iOS-specific instructions after a delay
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setIsIOS(true), 3000);
        setTimeout(() => setShow(true), 3000);
      }
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setTimeout(() => setShow(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-6 md:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b4164] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icons/icon-192x192.png"
              alt="Sylonow"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <p className="text-white font-semibold text-sm">Sylonow</p>
              <p className="text-[#a8c4d4] text-xs">sylonow.com</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {isIOS ? (
            <>
              <p className="text-gray-800 font-semibold text-sm mb-1">Add to Home Screen</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Tap the <span className="font-bold text-gray-700">Share</span> button at the bottom of your browser, then select{' '}
                <span className="font-bold text-gray-700">"Add to Home Screen"</span> to install Sylonow.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-800 font-semibold text-sm mb-1">Install Sylonow App</p>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">
                Install for a faster, app-like experience. Works offline too!
              </p>
              <button
                onClick={handleInstall}
                className="w-full bg-[#0b4164] hover:bg-[#0d4f7a] active:bg-[#083348] text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} />
                Install App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
