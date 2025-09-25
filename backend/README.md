# Async Upload Backend

A Go HTTP server for handling file uploads and job submissions for the async upload system.

## Features

- **File Upload**: Multipart file upload with size validation
- **Job Submission**: HPC job submission with file references
- **File Serving**: Secure file serving with path validation
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **Error Handling**: Comprehensive error responses
- **Security**: File path validation to prevent directory traversal

## API Endpoints

### POST /api/upload
Upload a single file using multipart form data.

**Request:**
- Content-Type: `multipart/form-data`
- Body: File in form field named `file`

**Response:**
```json
{
  "id": "uuid-string",
  "url": "http://localhost:8080/api/files/filename.ext",
  "name": "original-filename.ext",
  "size": 12345
}
```

### POST /api/submit
Submit a job with uploaded file references.

**Request:**
```json
{
  "jobName": "My HPC Job",
  "description": "Optional description",
  "priority": "normal",
  "files": [
    {
      "id": "file-uuid",
      "url": "file-url",
      "name": "filename.ext",
      "size": 12345
    }
  ]
}
```

**Response:**
```json
{
  "id": "job-uuid",
  "status": "submitted",
  "message": "Job submitted successfully"
}
```

### GET /api/files/{filename}
Serve uploaded files.

### GET /health
Health check endpoint.

## Configuration

The server can be configured through environment variables or by modifying the `Config` struct in `main.go`:

- `PORT`: Server port (default: 8080)
- `UPLOAD_DIR`: Directory for storing uploaded files (default: ./uploads)
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 100MB)

## Running the Server

```bash
# Install dependencies
go mod tidy

# Run the server
go run main.go

# Or build and run
go build -o server main.go
./server
```

The server will start on `http://localhost:8080` by default.

## File Storage

- Files are stored in the `./uploads` directory
- Each file gets a unique UUID-based filename
- Original filenames are preserved in the API response
- Files are served through the `/api/files/` endpoint

## Security Considerations

- File size validation (configurable limit)
- Path traversal protection
- CORS headers for cross-origin requests
- Input validation for all endpoints

## Error Handling

All errors return JSON responses with appropriate HTTP status codes:

```json
{
  "error": "Error message description"
}
```

Common error scenarios:
- File too large (413)
- Invalid file format (400)
- Missing required fields (400)
- File not found (404)
- Server errors (500)
