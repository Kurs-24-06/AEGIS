package logging

import (
	"context"
	"io"
	"os"
	"time"

	"github.com/opentracing/opentracing-go"
	"github.com/sirupsen/logrus"
)

// Logger is the main logger for the application
var Logger = logrus.New()

// InitLogger initializes the logger
func InitLogger(level string, format string) {
	// Set log level
	switch level {
	case "debug":
		Logger.SetLevel(logrus.DebugLevel)
	case "info":
		Logger.SetLevel(logrus.InfoLevel)
	case "warn":
		Logger.SetLevel(logrus.WarnLevel)
	case "error":
		Logger.SetLevel(logrus.ErrorLevel)
	default:
		Logger.SetLevel(logrus.InfoLevel)
	}

	// Set log format
	switch format {
	case "json":
		Logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
		})
	default:
		Logger.SetFormatter(&logrus.TextFormatter{
			TimestampFormat: time.RFC3339,
			FullTimestamp:   true,
		})
	}

	// Set output
	Logger.SetOutput(os.Stdout)
}

// SetOutput sets the logger output
func SetOutput(w io.Writer) {
	Logger.SetOutput(w)
}

// WithField adds a field to the logger
func WithField(key string, value interface{}) *logrus.Entry {
	return Logger.WithField(key, value)
}

// WithFields adds multiple fields to the logger
func WithFields(fields logrus.Fields) *logrus.Entry {
	return Logger.WithFields(fields)
}

// WithContext returns a logger with fields from context
func WithContext(ctx context.Context) *logrus.Entry {
	entry := Logger.WithContext(ctx)

	// Add trace info if available
	if span := opentracing.SpanFromContext(ctx); span != nil {
		if sc, ok := span.Context().(interface {
			TraceID() string
			SpanID() string
		}); ok {
			entry = entry.WithFields(logrus.Fields{
				"trace_id": sc.TraceID(),
				"span_id":  sc.SpanID(),
			})
		}
	}

	return entry
}