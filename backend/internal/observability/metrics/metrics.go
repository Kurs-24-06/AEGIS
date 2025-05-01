package metrics

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	// RequestDuration tracks the duration of HTTP requests
	RequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Duration of HTTP requests in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path", "status"},
	)

	// RequestTotal tracks the total number of HTTP requests
	RequestTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	// ErrorsTotal tracks the total number of errors
	ErrorsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "errors_total",
			Help: "Total number of errors",
		},
		[]string{"type"},
	)

	// DatabaseQueryDuration tracks the duration of database queries
	DatabaseQueryDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "database_query_duration_seconds",
			Help:    "Duration of database queries in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation", "table"},
	)

	// ActiveUsers tracks the number of active users
	ActiveUsers = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_users",
			Help: "Number of active users",
		},
	)

	// Version tracks the application version
	Version = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "version",
			Help: "Application version information",
		},
		[]string{"version"},
	)
)

// InstrumentHandler wraps an HTTP handler with metrics
func InstrumentHandler(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		// Create a response writer that captures the status code
		rw := newResponseWriter(w)
		
		// Call the original handler
		handler.ServeHTTP(rw, r)
		
		// Record metrics after the handler returns
		duration := time.Since(start).Seconds()
		statusCode := rw.statusCode
		
		RequestDuration.WithLabelValues(r.Method, r.URL.Path, string(statusCode)).Observe(duration)
		RequestTotal.WithLabelValues(r.Method, r.URL.Path, string(statusCode)).Inc()
	})
}

// responseWriter wraps http.ResponseWriter to capture the status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func newResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// MetricsHandler returns an HTTP handler for metrics
func MetricsHandler() http.Handler {
	return promhttp.Handler()
}

// SetVersion sets the application version
func SetVersion(version string) {
	Version.WithLabelValues(version).Set(1)
}