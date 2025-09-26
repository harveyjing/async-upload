# Docker-based Makefile for Async Upload v1 (using pnpm for frontend)
.PHONY: help build up down logs clean clean-all dev

# Default target
help:
	@echo "Async Upload v1 - Docker Commands"
	@echo "=================================="
	@echo "Development Commands:"
	@echo "  dev         - Start development environment"
	@echo "  build       - Build all Docker images"
	@echo "  up          - Start services (development)"
	@echo "  down        - Stop all services"
	@echo "  logs        - Show logs from all services"
	@echo "  logs-f      - Follow logs from all services"
	@echo ""
	@echo "Utility Commands:"
	@echo "  clean       - Clean up containers, images, and volumes"
	@echo "  clean-all   - Clean everything (including volumes)"
	@echo ""

# Development environment
dev: build up

build:
	@echo "🏗️  Building Docker images..."
	docker compose build

up:
	@echo "🚀 Starting development environment..."
	docker compose up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8080"
	@echo "Health:   http://localhost:8080/health"

down:
	@echo "🛑 Stopping services..."
	docker compose down

logs:
	docker compose logs

logs-f:
	docker compose logs -f
# Utility commands
clean:
	@echo "🧹 Cleaning up containers and images..."
	docker compose down --rmi all --remove-orphans
	docker system prune -f

clean-all:
	@echo "🧹 Cleaning everything including volumes..."
	docker compose down --rmi all --volumes --remove-orphans
	docker system prune -af --volumes

# Development helpers
restart:
	@echo "🔄 Restarting services..."
	docker compose restart

restart-be:
	@echo "🔄 Restarting backend..."
	docker compose restart backend

restart-fe:
	@echo "🔄 Restarting frontend..."
	docker compose restart frontend
