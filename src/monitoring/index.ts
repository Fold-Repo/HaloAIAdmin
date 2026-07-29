import { monitoringService } from './monitoring.service';
import { initWebVitals } from './web-vitals';

export { initWebVitals } from './web-vitals';
export { monitoringService, reportError } from './monitoring.service';
export type { MonitoringEvent, MonitoringLevel } from './monitoring.service';

export function initMonitoring() {
  monitoringService.init();
  initWebVitals();
}
