import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useThemeStore } from '@/store/themeStore';

export const AMLFraudDetector: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();
  const { theme } = useThemeStore();

  // Handle screen switching from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const screen = params.get('screen');

    if (screen && iframeRef.current?.contentWindow) {
      // Send screen change message to iframe
      iframeRef.current.contentWindow.postMessage(
        { type: 'SCREEN_CHANGE', screen },
        window.location.origin
      );
    }
  }, [location.search]);

  // Handle theme changes
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'THEME_CHANGE', theme },
        window.location.origin
      );
    }
  }, [theme]);

  // Listen for theme requests from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'REQUEST_THEME' && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'THEME_CHANGE', theme },
          window.location.origin
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [theme]);

  return (
    <Layout>
      <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/aml-fraud-detector/"
          className="w-full h-full border-0"
          title="AML Fraud Detector"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>
    </Layout>
  );
};
