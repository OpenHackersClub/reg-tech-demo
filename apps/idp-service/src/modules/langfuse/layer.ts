import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  BatchSpanProcessor,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-node';

// Setup Langfuse OTLP exporter
const auth = Buffer.from(
  `${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`,
).toString('base64');

console.log('🔧 Initializing OpenTelemetry with Langfuse...');

const langfuseExporter = new OTLPTraceExporter({
  url: process.env.LANGFUSE_OTEL_BASE_URL,
  headers: { Authorization: `Basic ${auth}` },
});

// Wrap the exporter to log when spans are sent
const loggingExporter: SpanExporter = {
  export: (spans, resultCallback) => {
    console.log(`📤 Exporting ${spans.length} span(s) to Langfuse`);
    spans.forEach((span) => {
      console.log(`  - Span: ${span.name} (${span.spanContext().traceId})`);
    });
    return langfuseExporter.export(spans, (result) => {
      if (result.code === 0) {
        console.log('✅ Spans exported successfully to Langfuse');
      } else {
        console.error('❌ Failed to export spans:', result.error);
      }
      resultCallback(result);
    });
  },
  shutdown: () => langfuseExporter.shutdown(),
};

export const OtelLayer = NodeSdk.layer(() => {
  console.log('🚀 OpenTelemetry SDK Layer created');

  return {
    resource: {
      serviceName: 'idp-service',
      serviceVersion: '1.0.0',
    },
    spanProcessor: new BatchSpanProcessor(loggingExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000,
    }),
  };
});
