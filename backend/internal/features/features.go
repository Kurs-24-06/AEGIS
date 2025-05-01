package features

import (
	"encoding/json"
	"os"
	"strings"
	"sync"
)

// Feature represents a toggleable feature
type Feature string

// Known features
const (
	ExperimentalFeature Feature = "experimental"
	DebugMode          Feature = "debugMode"
	Metrics            Feature = "metrics"
	AdvancedSecurity   Feature = "advancedSecurity"
	AIAssistant        Feature = "aiAssistant"
)

// FeatureToggle manages feature toggles
type FeatureToggle struct {
	features map[Feature]bool
	mu       sync.RWMutex
}

// NewFeatureToggle creates a new feature toggle manager
func NewFeatureToggle() *FeatureToggle {
	ft := &FeatureToggle{
		features: make(map[Feature]bool),
	}
	
	// Load from environment
	ft.loadFromEnvironment()
	
	return ft
}

// loadFromEnvironment loads feature toggles from environment variables
func (ft *FeatureToggle) loadFromEnvironment() {
	// Load from FEATURES env var (JSON format)
	featuresJSON := os.Getenv("FEATURES")
	if featuresJSON != "" {
		var features map[string]bool
		err := json.Unmarshal([]byte(featuresJSON), &features)
		if err == nil {
			ft.mu.Lock()
			for feature, enabled := range features {
				ft.features[Feature(feature)] = enabled
			}
			ft.mu.Unlock()
		}
	}
	
	// Load from individual feature env vars
	// Format: FEATURE_EXPERIMENTAL=true
	for _, env := range os.Environ() {
		if strings.HasPrefix(env, "FEATURE_") {
			parts := strings.SplitN(env, "=", 2)
			if len(parts) == 2 {
				featureName := strings.TrimPrefix(parts[0], "FEATURE_")
				featureValue := strings.ToLower(parts[1])
				
				ft.mu.Lock()
				ft.features[Feature(featureName)] = featureValue == "true" || featureValue == "1"
				ft.mu.Unlock()
			}
		}
	}
}

// IsEnabled checks if a feature is enabled
func (ft *FeatureToggle) IsEnabled(feature Feature) bool {
	ft.mu.RLock()
	defer ft.mu.RUnlock()
	
	enabled, exists := ft.features[feature]
	return exists && enabled
}

// SetFeature enables or disables a feature
func (ft *FeatureToggle) SetFeature(feature Feature, enabled bool) {
	ft.mu.Lock()
	defer ft.mu.Unlock()
	
	ft.features[feature] = enabled
}

// Features returns a copy of all feature states
func (ft *FeatureToggle) Features() map[Feature]bool {
	ft.mu.RLock()
	defer ft.mu.RUnlock()
	
	features := make(map[Feature]bool, len(ft.features))
	for feature, enabled := range ft.features {
		features[feature] = enabled
	}
	
	return features
}