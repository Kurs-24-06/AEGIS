package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthEndpoint(t *testing.T) {
	// Server erstellen (angenommen, Sie haben eine NewServer-Funktion)
	// server := NewServer()
	
	// Für dieses Beispiel erstellen wir einen Mock-Handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})
	
	// Test-Request erstellen
	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}
	
	// Response-Recorder erstellen
	rr := httptest.NewRecorder()
	
	// Request ausführen
	handler.ServeHTTP(rr, req)
	
	// Status-Code prüfen
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", 
			status, http.StatusOK)
	}
	
	// Response-Body prüfen
	expected := `{"status":"healthy"}`
	if rr.Body.String() != expected {
		t.Errorf("Handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}