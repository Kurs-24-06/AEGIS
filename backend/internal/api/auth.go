// backend/internal/api/auth.go
package api

import (
	"encoding/json"
	"net/http"

	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
)

// UserCredentials represents login request payload
type UserCredentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// User represents authenticated user info
type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Token    string `json:"token"`
	Role     string `json:"role"`
}

// Mock user data for demonstration
var mockUser = User{
	ID:       "1",
	Username: "admin",
	Token:    "mock-jwt-token",
	Role:     "admin",
}

// loginHandler handles user login requests
func (api *APIRouter) loginHandler(w http.ResponseWriter, r *http.Request) {
	var creds UserCredentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		logging.Logger.Errorf("Error decoding login request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Simple mock authentication logic
	if creds.Username == "admin" && creds.Password == "admin" {
		// Return mock user info with token
		writeJSONResponse(w, http.StatusOK, mockUser)
		return
	}

	writeErrorResponse(w, http.StatusUnauthorized, "Invalid username or password")
}

// logoutHandler handles user logout requests
func (api *APIRouter) logoutHandler(w http.ResponseWriter, r *http.Request) {
	// For stateless JWT, logout can be handled client-side by deleting token
	// Here, just return success response
	writeJSONResponse(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// validateTokenHandler validates the provided token
func (api *APIRouter) validateTokenHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logging.Logger.Errorf("Error decoding token validation request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Mock token validation: accept only the mock token
	valid := req.Token == mockUser.Token

	writeJSONResponse(w, http.StatusOK, map[string]bool{"valid": valid})
}
