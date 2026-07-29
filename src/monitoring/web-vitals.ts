import { monitoringService } from '@/monitoring/monitoring.service';

export function initWebVitals() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries.at(-1);
      if (last) {
        monitoringService.trackMetric('web_vital.lcp', last.startTime, { unit: 'ms' });
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // LCP not supported in this browser
  }

  try {
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if ('hadRecentInput' in entry && !(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
          clsValue += (entry as PerformanceEntry & { value?: number }).value ?? 0;
        }
      }
      if (clsValue > 0) {
        monitoringService.trackMetric('web_vital.cls', clsValue);
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // CLS not supported in this browser
  }

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation) {
      monitoringService.trackMetric(
        'web_vital.ttfb',
        navigation.responseStart - navigation.requestStart,
        { unit: 'ms' },
      );
    }
  });
}
