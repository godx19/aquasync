// Package handlers provides HTTP handler functions for AquaSyncs API.
package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// ContactRequest represents the incoming contact form payload.
type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Service string `json:"service"`
	Message string `json:"message"`
}

// APIResponse is the standard JSON response envelope.
type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Time    string `json:"timestamp,omitempty"`
}

// EnableCORS sets permissive CORS headers for development.
// In production, restrict Allow-Origin to your domain.
func EnableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

// writeJSON serialises v as JSON and writes it to w with the given status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("[ERROR] writeJSON: %v", err)
	}
}

// HealthHandler returns a simple liveness check.
//
//	GET /api/health
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "healthy",
		"service": "AquaSyncs API",
		"version": "1.0.0",
		"time":    time.Now().Format(time.RFC3339),
	})
}

// ContactHandler processes contact-form submissions.
//
//	POST /api/contact
//	Body: { "name": "", "email": "", "phone": "", "service": "", "message": "" }
func ContactHandler(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)

	// Handle CORS pre-flight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, APIResponse{
			Success: false, Message: "Method not allowed. Use POST.",
		})
		return
	}

	// Decode body
	var req ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, APIResponse{
			Success: false, Message: "Invalid JSON payload.",
		})
		return
	}
	defer r.Body.Close()

	// Basic validation
	req.Name    = strings.TrimSpace(req.Name)
	req.Email   = strings.TrimSpace(req.Email)
	req.Message = strings.TrimSpace(req.Message)

	if req.Name == "" {
		writeJSON(w, http.StatusBadRequest, APIResponse{Success: false, Message: "Name is required."})
		return
	}
	if req.Email == "" || !strings.Contains(req.Email, "@") {
		writeJSON(w, http.StatusBadRequest, APIResponse{Success: false, Message: "A valid email is required."})
		return
	}
	if req.Message == "" {
		writeJSON(w, http.StatusBadRequest, APIResponse{Success: false, Message: "Message cannot be empty."})
		return
	}

	// Structured log entry
	now := time.Now()
	log.Printf("[CONTACT] %s | from=%s | email=%s | service=%s",
		now.Format(time.RFC3339), req.Name, req.Email, req.Service)

	// Persist to contacts.log (append-only)
	if err := appendContactLog(req, now); err != nil {
		log.Printf("[WARN] Could not write contact log: %v", err)
	}

	writeJSON(w, http.StatusOK, APIResponse{
		Success: true,
		Message: "Message received! We'll get back to you within 24 hours.",
		Time:    now.Format(time.RFC3339),
	})
}

// appendContactLog appends a single contact entry to contacts.log.
func appendContactLog(req ContactRequest, t time.Time) error {
	f, err := os.OpenFile("contacts.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()

	entry := fmt.Sprintf(
		"[%s] name=%q email=%q phone=%q service=%q message=%q\n",
		t.Format(time.RFC3339),
		req.Name, req.Email, req.Phone, req.Service, req.Message,
	)
	_, err = f.WriteString(entry)
	return err
}

// ServicesHandler returns the list of available services as JSON.
//
//	GET /api/services
func ServicesHandler(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	services := []map[string]string{
		{"id": "consultation", "name": "Consultation Services",    "icon": "comments"},
		{"id": "documentation","name": "Documentation & Admin",    "icon": "file-alt"},
		{"id": "business",     "name": "Business Support",          "icon": "briefcase"},
		{"id": "digital",      "name": "Digital & Technology",      "icon": "laptop-code"},
		{"id": "training",     "name": "Training & Development",    "icon": "graduation-cap"},
		{"id": "iot",          "name": "IoT Integration",           "icon": "network-wired"},
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success":  true,
		"services": services,
	})
}

// TeamHandler returns team members as JSON.
//
//	GET /api/team
func TeamHandler(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	team := []map[string]string{
		{"name": "Jitu",               "role": "Founder & Director",      "email": "jitu@jitusoffice.com"},
		{"name": "Senior Consultant",  "role": "Advisory & Client Rel.",  "email": "consultant@jitusoffice.com"},
		{"name": "Admin Head",         "role": "Administrative Head",     "email": "admin@jitusoffice.com"},
		{"name": "Digital Specialist", "role": "Web, Tech & Digital Mktg","email": "digital@jitusoffice.com"},
		{"name": "Training Coord.",    "role": "Workshops & Dev.",         "email": "training@jitusoffice.com"},
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"team":    team,
	})
}

