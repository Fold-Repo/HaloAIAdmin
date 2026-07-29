import { describe, expect, it } from 'vitest';

import { monitoringService } from '@/monitoring';

describe('monitoring service', () => {
  it('tracks events and metrics', () => {
    monitoringService.flush();
    monitoringService.trackEvent('test.event', { ok: true });
    monitoringService.trackMetric('test.metric', 42);

    const events = monitoringService.getRecentEvents();
    expect(events.some((event) => event.name === 'test.event')).toBe(true);
    expect(events.some((event) => event.name === 'test.metric')).toBe(true);
  });
});
