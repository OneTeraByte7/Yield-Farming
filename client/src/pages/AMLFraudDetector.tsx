import React, { useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useThemeStore } from '@/store/themeStore';
import { useSearchParams } from 'react-router-dom';

export const AMLFraudDetector: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useThemeStore((state) => state.theme);
  const [searchParams] = useSearchParams();
  const screen = searchParams.get('screen') || 'dashboard';

  // Get AML API URL from environment variable
  const amlApiUrl = import.meta.env.VITE_AML_API_URL || 'https://yield-aml-detector.onrender.com';

  useEffect(() => {
    // Send theme to iframe when it loads or when theme changes
    const sendThemeToIframe = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'THEME_CHANGE', theme },
          amlApiUrl
        );
      }
    };

    // Send theme when iframe loads
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', sendThemeToIframe);
    }

    // Send theme immediately if iframe is already loaded
    sendThemeToIframe();

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', sendThemeToIframe);
      }
    };
  }, [theme, amlApiUrl]);

  useEffect(() => {
    // Send screen change to iframe when screen parameter changes
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SCREEN_CHANGE', screen },
        amlApiUrl
      );
    }
  }, [screen, amlApiUrl]);

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
        <iframe
          ref={iframeRef}
          src={amlApiUrl}
          className="w-full h-full border-0"
          title="AML Fraud Detector"
        />
      </div>
    </Layout>
  );
};
