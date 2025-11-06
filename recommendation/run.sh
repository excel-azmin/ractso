#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Set environment variables if .env file exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run the FastAPI app with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-4000} --reload
