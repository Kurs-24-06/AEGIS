package tracing

import (
	"context"
	"io"
	"net/http"

	"github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/ext"
	"github.com/uber/jaeger-client-go"
	jaegercfg "github.com/uber/jaeger-client-go/config"
	jaegerlog "github.com/uber/jaeger-client-go/log"
	"github.com/uber/jaeger-lib/metrics"
)

// InitTracer initializes the Jaeger tracer
func InitTracer(serviceName string) (opentracing.Tracer, io.Closer, error) {
	cfg := jaegercfg.Configuration{
		ServiceName: serviceName,
		Sampler: &jaegercfg.SamplerConfig{
			Type:  jaeger.SamplerTypeConst,
			Param: 1,
		},
		Reporter: &jaegercfg.ReporterConfig{
			LogSpans: true,
		},
	}

	jLogger := jaegerlog.StdLogger
	jMetricsFactory := metrics.NullFactory

	return cfg.NewTracer(
		jaegercfg.Logger(jLogger),
		jaegercfg.Metrics(jMetricsFactory),
	)
}

// Middleware returns a middleware that traces HTTP requests
func Middleware(tracer opentracing.Tracer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract span from request
			wireContext, err := tracer.Extract(
				opentracing.HTTPHeaders,
				opentracing.HTTPHeadersCarrier(r.Header),
			)

			// Create a new span or continue from one if it exists
			var span opentracing.Span
			if err != nil {
				span = tracer.StartSpan(r.URL.Path)
			} else {
				span = tracer.StartSpan(r.URL.Path, ext.RPCServerOption(wireContext))
			}
			defer span.Finish()

			// Set span tags
			ext.HTTPMethod.Set(span, r.Method)
			ext.HTTPUrl.Set(span, r.URL.String())

			// Create a new context with the span
			ctx := opentracing.ContextWithSpan(r.Context(), span)
			r = r.WithContext(ctx)

			// Call the next handler with the enriched request
			next.ServeHTTP(w, r)
		})
	}
}

// StartSpanFromContext starts a new span from a context
func StartSpanFromContext(ctx context.Context, operationName string) (opentracing.Span, context.Context) {
	if ctx == nil {
		ctx = context.Background()
	}

	span, ctx := opentracing.StartSpanFromContext(ctx, operationName)
	return span, ctx
}