#!/bin/bash

set -e

echo "Running HEALio test suite..."

# Unit tests
echo "Running unit tests..."
pytest tests/unit/ -v --cov=backend --cov-report=term-missing

# Integration tests (if backend URL provided)
if [ ! -z "$BACKEND_URL" ]; then
    echo "Running integration tests against $BACKEND_URL..."
    pytest tests/integration/ -v --backend-url=$BACKEND_URL
fi

# Frontend tests
if [ -d "frontend" ]; then
    echo "Running frontend tests..."
    cd frontend
    npm test
    cd ..
fi

echo "All tests completed!"
