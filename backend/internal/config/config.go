// backend/internal/config/config.go
package config

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// Config repräsentiert die Anwendungskonfiguration
type Config struct {
	Server struct {
		Port  int  `yaml:"port"`
		Debug bool `yaml:"debug"`
		CORS  struct {
			AllowedOrigins []string `yaml:"allowed_origins"`
			AllowedMethods []string `yaml:"allowed_methods"`
			AllowedHeaders []string `yaml:"allowed_headers"`
		} `yaml:"cors"`
	} `yaml:"server"`

	Database struct {
		Type     string `yaml:"type"`
		Host     string `yaml:"host"`
		Port     int    `yaml:"port"`
		User     string `yaml:"user"`
		Password string `yaml:"password"`
		Name     string `yaml:"name"`
		SSLMode  string `yaml:"sslMode"`
	} `yaml:"database"`

	Redis struct {
		Host     string `yaml:"host"`
		Port     int    `yaml:"port"`
		Password string `yaml:"password"`
	} `yaml:"redis"`

	Simulation struct {
		WorkerCount          int `yaml:"worker_count"`
		BufferSize           int `yaml:"buffer_size"`
		DefaultTimeoutSeconds int `yaml:"default_timeout_seconds"`
	} `yaml:"simulation"`

	Logging struct {
		Level  string `yaml:"level"`
		Format string `yaml:"format"`
	} `yaml:"logging"`

	Auth struct {
		Enabled    bool   `yaml:"enabled"`
		JWTSecret  string `yaml:"jwt_secret"`
		TokenExpiry string `yaml:"token_expiry"`
	} `yaml:"auth"`
}

// LoadConfig lädt die Konfiguration basierend auf der Umgebung
func LoadConfig() (*Config, error) {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "dev" // Standardmäßig Entwicklungsumgebung
	}

	configPath := filepath.Join("config", fmt.Sprintf("config.%s.yaml", env))
	
	// Datei öffnen
	file, err := os.Open(configPath)
	if err != nil {
		return nil, fmt.Errorf("Fehler beim Öffnen der Konfigurationsdatei: %w", err)
	}
	defer file.Close()

	// Konfiguration einlesen
	var cfg Config
	decoder := yaml.NewDecoder(file)
	if err := decoder.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("Fehler beim Decodieren der Konfiguration: %w", err)
	}

	// Umgebungsvariablen verarbeiten
	processEnvVars(&cfg)

	return &cfg, nil
}

// processEnvVars ersetzt Platzhalter durch Umgebungsvariablen
func processEnvVars(cfg *Config) {
	// Beispiel für Datenbankhost
	if dbHost := os.Getenv("DB_HOST"); dbHost != "" && cfg.Database.Host == "${DB_HOST}" {
		cfg.Database.Host = dbHost
	}
	
	// Ähnliche Ersetzungen für andere Konfigurationswerte
	// ...
}