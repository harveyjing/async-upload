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

	"github.com/google/uuid"
)

type Config struct {
	Port        string
	UploadDir   string
	MaxFileSize int64 // in bytes
}

type FileUploadResponse struct {
	ID   string `json:"id"`
	URL  string `json:"url"`
	Name string `json:"name"`
	Size int64  `json:"size"`
}

type JobSubmissionRequest struct {
	JobName     string               `json:"jobName"`
	Description string               `json:"description"`
	Priority    string               `json:"priority"`
	Files       []FileUploadResponse `json:"files"`
}

type JobSubmissionResponse struct {
	ID      string `json:"id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type FileInfo struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Size       int64  `json:"size"`
	URL        string `json:"url"`
	UploadedAt string `json:"uploadedAt"`
}

type FilesListResponse struct {
	Files []FileInfo `json:"files"`
	Total int        `json:"total"`
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
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

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

	// Parse multipart form with max memory
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

	// Generate unique filename
	fileID := uuid.New().String()
	fileExt := filepath.Ext(header.Filename)
	fileName := fileID + fileExt
	filePath := filepath.Join(config.UploadDir, fileName)

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
		ID:   fileID,
		URL:  fmt.Sprintf("http://localhost:%s/api/files/%s", config.Port, fileName),
		Name: header.Filename,
		Size: header.Size,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("File uploaded successfully: %s (ID: %s, Size: %d bytes)", header.Filename, fileID, header.Size)
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

	if len(req.Files) == 0 {
		respondWithError(w, "At least one file is required", http.StatusBadRequest)
		return
	}

	// Validate priority
	validPriorities := map[string]bool{"low": true, "normal": true, "high": true}
	if !validPriorities[req.Priority] {
		req.Priority = "normal" // Default to normal if invalid
	}

	// Generate job ID
	jobID := uuid.New().String()

	// In a real implementation, you would:
	// 1. Store job metadata in a database
	// 2. Queue the job for processing
	// 3. Return job tracking information

	response := JobSubmissionResponse{
		ID:      jobID,
		Status:  "submitted",
		Message: fmt.Sprintf("Job '%s' submitted successfully with %d files", req.JobName, len(req.Files)),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("Job submitted: ID=%s, Name=%s, Files=%d, Priority=%s",
		jobID, req.JobName, len(req.Files), req.Priority)
}

// File serving handler
func serveFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract filename from URL path
	fileName := strings.TrimPrefix(r.URL.Path, "/api/files/")
	if fileName == "" {
		http.Error(w, "File name required", http.StatusBadRequest)
		return
	}

	// Validate filename (prevent directory traversal)
	if strings.Contains(fileName, "..") || strings.Contains(fileName, "/") {
		http.Error(w, "Invalid file name", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(config.UploadDir, fileName)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Serve the file
	http.ServeFile(w, r, filePath)
}

// List uploaded files handler
func listFilesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read the uploads directory
	files, err := os.ReadDir(config.UploadDir)
	if err != nil {
		respondWithError(w, "Failed to read uploads directory", http.StatusInternalServerError)
		return
	}

	var fileInfos []FileInfo
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		fileInfo, err := file.Info()
		if err != nil {
			log.Printf("Failed to get file info for %s: %v", file.Name(), err)
			continue
		}

		// Extract original filename and file ID from the filename
		// Format: {uuid}.{ext} where original name is lost
		// For now, we'll use the filename as is
		fileName := file.Name()
		fileID := strings.TrimSuffix(fileName, filepath.Ext(fileName))

		fileData := FileInfo{
			ID:         fileID,
			Name:       fileName, // In a real app, you'd store original names in a database
			Size:       fileInfo.Size(),
			URL:        fmt.Sprintf("http://localhost:%s/api/files/%s", config.Port, fileName),
			UploadedAt: fileInfo.ModTime().Format(time.RFC3339),
		}
		fileInfos = append(fileInfos, fileData)
	}

	response := FilesListResponse{
		Files: fileInfos,
		Total: len(fileInfos),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("Listed %d files", len(fileInfos))
}

// Helper function to send error responses
func respondWithError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
	log.Printf("Error response: %s (Status: %d)", message, statusCode)
}
