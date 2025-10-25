// Device and browser detection utilities

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 0;

  // Check for memory (if available)
  const memory = (navigator as any).deviceMemory || 0;

  // Consider it low-end if < 4 cores or < 4GB RAM
  return cores < 4 || (memory > 0 && memory < 4);
};

export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getPerformanceLevel = (): 'low' | 'medium' | 'high' => {
  if (typeof window === 'undefined') return 'medium';

  const mobile = isMobile();
  const safari = isSafari();
  const lowEnd = isLowEndDevice();

  // Safari mobile is particularly sensitive
  if (mobile && safari) return 'low';
  if (lowEnd) return 'low';
  if (mobile) return 'medium';

  return 'high';
};
