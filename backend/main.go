package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Config struct {
	Port        string
	UploadDir   string
	MaxFileSize int64 // in bytes
}

type FileUploadResponse struct {
	URL  string `json:"url"`
	Name string `json:"name"`
	Size int64  `json:"size"`
}

type JobSubmissionRequest struct {
	JobName string `json:"jobName"`
}

type JobSubmissionResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

type JobInfo struct {
	Name      string `json:"name"`
	CreatedAt string `json:"createdAt"`
	FileCount int    `json:"fileCount"`
}

type JobListResponse struct {
	Jobs []JobInfo `json:"jobs"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type FileInfo struct {
	Name       string `json:"name"`
	Size       int64  `json:"size"`
	URL        string `json:"url"`
	UploadedAt string `json:"uploadedAt"`
	IsDir      bool   `json:"isDir"`
}

type FilesListResponse struct {
	Items []FileInfo `json:"items"`
}

var config = Config{
	Port:        "8080",
	UploadDir:   "./uploads",
	MaxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
}

func main() {
	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll(config.UploadDir, 0755); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}

	// Setup routes
	mux := http.NewServeMux()
	mux.HandleFunc("/api/upload", corsMiddleware(uploadHandler))
	mux.HandleFunc("/api/submit", corsMiddleware(submitHandler))
	mux.HandleFunc("/api/files/", corsMiddleware(serveFileHandler))
	mux.HandleFunc("/api/files", corsMiddleware(listFilesHandler))
	mux.HandleFunc("/health", healthHandler)

	fmt.Printf("Server starting on port %s\n", config.Port)
	fmt.Printf("Upload directory: %s\n", config.UploadDir)
	fmt.Printf("Max file size: %d bytes (%.1f MB)\n", config.MaxFileSize, float64(config.MaxFileSize)/(1024*1024))

	log.Fatal(http.ListenAndServe(":"+config.Port, mux))
}

// CORS middleware to handle cross-origin requests
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Job-Name")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// Health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

// File upload handler
func uploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read headers first for quick validation
	jobName := r.Header.Get("X-Job-Name")
	if jobName == "" {
		respondWithError(w, "Job name is required in X-Job-Name header", http.StatusBadRequest)
		return
	}

	// Check if job directory already exists (quick validation before reading body)
	jobDir := filepath.Join(config.UploadDir, jobName)
	// if _, err := os.Stat(jobDir); err == nil {
	// 	respondWithError(w, fmt.Sprintf("Job directory '%s' already exists", jobName), http.StatusConflict)
	// 	return
	// }

	// Now parse multipart form only after validation passes
	err := r.ParseMultipartForm(32 << 20) // 32MB in memory
	if err != nil {
		respondWithError(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		respondWithError(w, "Failed to get file from form", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file size
	if header.Size > config.MaxFileSize {
		respondWithError(w, fmt.Sprintf("File too large. Maximum size is %d bytes", config.MaxFileSize), http.StatusBadRequest)
		return
	}

	// Create job-specific directory using job name
	if err := os.MkdirAll(jobDir, 0755); err != nil {
		respondWithError(w, "Failed to create job directory", http.StatusInternalServerError)
		return
	}

	// Use original filename
	filePath := filepath.Join(jobDir, header.Filename)

	// Create the file
	dst, err := os.Create(filePath)
	if err != nil {
		respondWithError(w, "Failed to create file on server", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy file content
	_, err = io.Copy(dst, file)
	if err != nil {
		os.Remove(filePath) // Clean up on error
		respondWithError(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := FileUploadResponse{
		URL:  fmt.Sprintf("http://localhost:%s/api/files/%s/%s", config.Port, jobName, header.Filename),
		Name: header.Filename,
		Size: header.Size,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("File uploaded successfully: %s (Job: %s, Size: %d bytes)", header.Filename, jobName, header.Size)
}

// Job submission handler
func submitHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req JobSubmissionRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		respondWithError(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if strings.TrimSpace(req.JobName) == "" {
		respondWithError(w, "Job name is required", http.StatusBadRequest)
		return
	}

	// Create job directory if it doesn't exist
	jobDir := filepath.Join(config.UploadDir, req.JobName)
	if err := os.MkdirAll(jobDir, 0755); err != nil {
		respondWithError(w, "Failed to create job directory", http.StatusInternalServerError)
		return
	}

	response := JobSubmissionResponse{
		Status:  "submitted",
		Message: fmt.Sprintf("Job '%s' submitted successfully", req.JobName),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("Job submitted: Name=%s", req.JobName)
}

// File serving handler
func serveFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract path from URL: /api/files/jobName/filename
	urlPath := strings.TrimPrefix(r.URL.Path, "/api/files/")
	if urlPath == "" {
		http.Error(w, "File path required", http.StatusBadRequest)
		return
	}

	// Parse the path to extract job name and filename
	pathParts := strings.Split(urlPath, "/")
	if len(pathParts) != 2 {
		http.Error(w, "Invalid file path format", http.StatusBadRequest)
		return
	}

	jobName := pathParts[0]
	fileName := pathParts[1]

	// Validate filename (prevent directory traversal)
	if strings.Contains(fileName, "..") || strings.Contains(fileName, "/") {
		http.Error(w, "Invalid file name", http.StatusBadRequest)
		return
	}

	var filePath string
	if jobName == "root" {
		// Handle root files (files in the uploads directory root)
		filePath = filepath.Join(config.UploadDir, fileName)
	} else {
		// Handle files in job directories
		filePath = filepath.Join(config.UploadDir, jobName, fileName)
	}

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Serve the file
	http.ServeFile(w, r, filePath)
}

// List files and directories handler
func listFilesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get path parameter to support browsing subdirectories
	path := r.URL.Query().Get("path")
	if path == "" {
		path = "" // Root directory
	}

	// Validate path (prevent directory traversal)
	if strings.Contains(path, "..") {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	targetDir := filepath.Join(config.UploadDir, path)

	// Read the target directory
	entries, err := os.ReadDir(targetDir)
	if err != nil {
		respondWithError(w, "Failed to read directory", http.StatusInternalServerError)
		return
	}

	var items []FileInfo
	for _, entry := range entries {
		fileInfo, err := entry.Info()
		if err != nil {
			log.Printf("Failed to get file info for %s: %v", entry.Name(), err)
			continue
		}

		var itemURL string
		if entry.IsDir() {
			// For directories, URL points to list endpoint with path parameter
			subPath := filepath.Join(path, entry.Name())
			itemURL = fmt.Sprintf("http://localhost:%s/api/files?path=%s", config.Port, subPath)
		} else {
			// For files, URL points to file serving endpoint
			if path == "" {
				itemURL = fmt.Sprintf("http://localhost:%s/api/files/root/%s", config.Port, entry.Name())
			} else {
				itemURL = fmt.Sprintf("http://localhost:%s/api/files/%s/%s", config.Port, path, entry.Name())
			}
		}

		item := FileInfo{
			Name:       entry.Name(),
			Size:       fileInfo.Size(),
			URL:        itemURL,
			UploadedAt: fileInfo.ModTime().Format(time.RFC3339),
			IsDir:      entry.IsDir(),
		}
		items = append(items, item)
	}

	response := FilesListResponse{
		Items: items,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("Listed %d items in path: %s", len(items), path)
}

// Helper function to send error responses
func respondWithError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
	log.Printf("Error response: %s (Status: %d)", message, statusCode)
}
