import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

// Read configuration from environment variables
const serviceName = process.env.OTEL_SERVICE_NAME || 'citrus-reach'
const dash0Endpoint = process.env.DASH0_OTLP_ENDPOINT
const dash0AuthToken = process.env.DASH0_AUTHORIZATION_TOKEN

if (!dash0Endpoint) {
  console.error('DASH0_OTLP_ENDPOINT is not set. OpenTelemetry will not be initialized.')
  process.exit(1)
}

if (!dash0AuthToken) {
  console.error('DASH0_AUTHORIZATION_TOKEN is not set. OpenTelemetry will not be initialized.')
  process.exit(1)
}

// Configure the trace exporter with Dash0 endpoint and auth
const traceExporter = new OTLPTraceExporter({
  url: `${dash0Endpoint}/v1/traces`,
  headers: {
    Authorization: `Bearer ${dash0AuthToken}`,
  },
})

// Configure the metrics exporter with Dash0 endpoint and auth
const metricExporter = new OTLPMetricExporter({
  url: `${dash0Endpoint}/v1/metrics`,
  headers: {
    Authorization: `Bearer ${dash0AuthToken}`,
  },
})

// Create the OpenTelemetry SDK
const sdk = new NodeSDK({
  serviceName,
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // Export metrics every 60 seconds
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable fs instrumentation as it can be noisy
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      // Disable winston instrumentation to avoid missing dependency
      '@opentelemetry/instrumentation-winston': {
        enabled: false,
      },
    }),
  ],
})

// Start the SDK
sdk.start()

console.log('OpenTelemetry instrumentation initialized successfully')
console.log(`Service: ${serviceName}`)
console.log(`Endpoint: ${dash0Endpoint}`)

// Gracefully shutdown the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0))
})
