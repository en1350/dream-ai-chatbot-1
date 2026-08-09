import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    _tmr?: Array<Record<string, unknown>>;
    ym?: (id: number, action: string, url?: string) => void;
  }
}

const TMR_ID = '3785873';
const YM_ID = 101026698;

const PageTracking = () => {
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const url = location.pathname + location.search;

    window._tmr?.push({ id: TMR_ID, type: 'pageView', url, start: Date.now() });
    window.ym?.(YM_ID, 'hit', url);
  }, [location.pathname, location.search]);

  return null;
};

export default PageTracking;
