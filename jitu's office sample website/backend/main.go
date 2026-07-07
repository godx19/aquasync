// main.go â€” Entry point for AquaSyncs backend server (Go)
// IoT-themed professional services website backend
//
// Run:  go run main.go
// Build: go build -o server.exe .
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"jitusoffice/handlers"
)

func main() {
	// â”€â”€ Port â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// â”€â”€ Router â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/health",   handlers.HealthHandler)
	mux.HandleFunc("/api/contact",  handlers.ContactHandler)
	mux.HandleFunc("/api/services", handlers.ServicesHandler)
	mux.HandleFunc("/api/team",     handlers.TeamHandler)

	// Serve frontend static files
	// The frontend folder is one level up from backend/
	frontendDir := "../frontend"
	if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
		// Fallback if running from project root
		frontendDir = "./frontend"
	}
	fs := http.FileServer(http.Dir(frontendDir))
	mux.Handle("/", fs)

	// â”€â”€ Server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      loggingMiddleware(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// â”€â”€ Startup banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	fmt.Println()
	fmt.Println("  â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—")
	fmt.Println("  â•‘      AquaSyncs â€” IoT Backend API       â•‘")
	fmt.Println("  â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•")
	fmt.Printf("  ðŸš€  Server  â†’ http://localhost:%s\n", port)
	fmt.Printf("  ðŸ“¡  Health  â†’ http://localhost:%s/api/health\n", port)
	fmt.Printf("  ðŸ“¬  Contact â†’ http://localhost:%s/api/contact\n", port)
	fmt.Printf("  ðŸ› ï¸   Servicesâ†’ http://localhost:%s/api/services\n", port)
	fmt.Printf("  ðŸ‘¥  Team    â†’ http://localhost:%s/api/team\n", port)
	fmt.Printf("  ðŸŒ  Static  â†’ http://localhost:%s/\n", port)
	fmt.Println()

	log.Fatal(srv.ListenAndServe())
}

// loggingMiddleware logs every incoming HTTP request.
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw    := &responseWriter{ResponseWriter: w, status: 200}
		next.ServeHTTP(rw, r)
		log.Printf("[%s] %d %s %s (%s)",
			time.Now().Format("15:04:05"),
			rw.status,
			r.Method,
			r.URL.Path,
			time.Since(start),
		)
	})
}

// responseWriter wraps http.ResponseWriter to capture the status code.
type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

