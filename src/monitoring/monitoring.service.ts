import { appConfig } from '@/config';

export type MonitoringLevel = 'info' | 'warning' | 'error';

export type MonitoringEvent = {
  name: string;
  level: MonitoringLevel;
  message?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

type MonitoringSink = (event: MonitoringEvent) => void;

const eventBuffer: MonitoringEvent[] = [];
const sinks: MonitoringSink[] = [];

function emit(event: Omit<MonitoringEvent, 'timestamp'>) {
  const payload: MonitoringEvent = { ...event, timestamp: new Date().toISOString() };
  eventBuffer.push(payload);

  if (eventBuffer.length > 100) {
    eventBuffer.shift();
  }

  sinks.forEach((sink) => sink(payload));

  if (appConfig.isDev) {
    const label = `[monitoring:${payload.level}] ${payload.name}`;
    if (payload.level === 'error') {
      console.error(label, payload.message, payload.metadata);
    } else if (payload.level === 'warning') {
      console.warn(label, payload.message, payload.metadata);
    } else {
      console.info(label, payload.message, payload.metadata);
    }
  }
}

export const monitoringService = {
  init() {
    emit({
      name: 'app.start',
      level: 'info',
      message: `${appConfig.name} v${appConfig.version} started`,
      metadata: { environment: appConfig.isProd ? 'production' : 'development' },
    });

    window.addEventListener('unhandledrejection', (event) => {
      reportError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        source: 'unhandledrejection',
      });
    });
  },

  registerSink(sink: MonitoringSink) {
    sinks.push(sink);
  },

  trackEvent(name: string, metadata?: Record<string, unknown>) {
    emit({ name, level: 'info', metadata });
  },

  trackMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    emit({ name, level: 'info', message: String(value), metadata: { value, ...metadata } });
  },

  getRecentEvents() {
    return [...eventBuffer];
  },

  flush() {
    eventBuffer.length = 0;
  },
};

export function reportError(error: Error, metadata?: Record<string, unknown>) {
  monitoringService.trackEvent('app.error', {
    message: error.message,
    stack: error.stack,
    ...metadata,
  });

  emit({
    name: 'app.error',
    level: 'error',
    message: error.message,
    metadata: { stack: error.stack, ...metadata },
  });
}
