# OpenTelemetry Setup for Dash0

This document describes the OpenTelemetry instrumentation setup for sending telemetry data to Dash0.

## Overview

The citrus-reach application is now instrumented with OpenTelemetry to send traces and metrics to Dash0. The instrumentation automatically captures:

- HTTP requests and responses
- Database queries
- External API calls
- Custom spans and metrics

## Configuration

### Environment Variables

The following environment variables are required in your `.env.local` file:

```bash
# Dash0 Authorization Token
DASH0_AUTHORIZATION_TOKEN="your-authorization-token"

# Dash0 OTLP Endpoint (without /v1/traces or /v1/metrics)
DASH0_OTLP_ENDPOINT="https://ingress.us-west-2.aws.dash0.com"

# Optional: Override service name (defaults to 'citrus-reach')
OTEL_SERVICE_NAME="citrus-reach"
```

### Files Created

1. **[instrumentation.ts](instrumentation.ts)** - Entry point for Next.js instrumentation hook
2. **[instrumentation.node.ts](instrumentation.node.ts)** - Node.js-specific OpenTelemetry configuration
3. **[next.config.mjs](next.config.mjs)** - Updated to enable `instrumentationHook`

## Packages Installed

The following OpenTelemetry packages were installed:

```json
{
  "@opentelemetry/sdk-node": "^0.206.0",
  "@opentelemetry/resources": "^2.1.0",
  "@opentelemetry/semantic-conventions": "^1.37.0",
  "@opentelemetry/sdk-trace-node": "^2.1.0",
  "@opentelemetry/exporter-trace-otlp-http": "^0.206.0",
  "@opentelemetry/instrumentation": "^0.206.0",
  "@opentelemetry/auto-instrumentations-node": "^0.65.0",
  "@opentelemetry/exporter-metrics-otlp-http": "^0.206.0",
  "@opentelemetry/sdk-metrics": "^2.1.0"
}
```

## How It Works

1. Next.js calls the `register()` function in `instrumentation.ts` when the server starts
2. For Node.js runtime, it imports `instrumentation.node.ts`
3. The OpenTelemetry SDK is initialized with:
   - OTLP HTTP exporters for traces and metrics
   - Automatic instrumentation for HTTP, Express, and other common libraries
   - Configuration from environment variables
   - Dash0 endpoint and authentication

4. Traces are sent to `${DASH0_OTLP_ENDPOINT}/v1/traces`
5. Metrics are sent to `${DASH0_OTLP_ENDPOINT}/v1/metrics` every 60 seconds

## Features

- **Automatic Instrumentation**: Captures HTTP requests, database queries, and more automatically
- **Metrics Export**: Sends metrics to Dash0 every 60 seconds
- **Graceful Shutdown**: Properly flushes telemetry data on SIGTERM
- **Service Naming**: Automatically uses the service name from environment or defaults to 'citrus-reach'
- **Disabled Noisy Instrumentations**: File system instrumentation is disabled to reduce noise

## Verification

After starting your application with `pnpm dev`, you should see:

```
OpenTelemetry instrumentation initialized successfully
Service: citrus-reach
Endpoint: https://ingress.us-west-2.aws.dash0.com
```

You can then view your traces and metrics in the Dash0 dashboard.

## Troubleshooting

### Warnings About Missing Modules

You may see warnings about `@opentelemetry/winston-transport` and `@opentelemetry/exporter-jaeger`. These are expected and can be safely ignored - these instrumentations are disabled or not used.

### No Data in Dash0

1. Verify your `DASH0_AUTHORIZATION_TOKEN` is correct
2. Verify your `DASH0_OTLP_ENDPOINT` is correct
3. Check that your application is making requests (telemetry is only sent when there's activity)
4. Wait up to 60 seconds for metrics to be exported
5. Check the console for any error messages from OpenTelemetry

## Production Deployment

For production deployments:

1. Ensure all environment variables are set in your production environment
2. The instrumentation will automatically initialize when the application starts
3. Consider adjusting the metric export interval in `instrumentation.node.ts` if needed
4. Monitor the Dash0 dashboard for incoming telemetry data

## Additional Resources

- [Next.js OpenTelemetry Documentation](https://nextjs.org/docs/app/guides/open-telemetry)
- [Dash0 Documentation](https://www.dash0.com/docs)
- [OpenTelemetry JavaScript Documentation](https://opentelemetry.io/docs/languages/js/)
