import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Gauge, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
    private readonly registry = new Registry();

    constructor() {
        collectDefaultMetrics({ register: this.registry });

        // Define custom metrics here
        this.registry.registerMetric(new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'status_code'],
        }));

        this.registry.registerMetric(new Gauge({
            name: 'http_request_duration_seconds',
            help: 'Histogram of HTTP request durations in seconds',
            labelNames: ['method'],
        }));
    }

    getMetrics() {
        return this.registry.metrics();
    }
}
