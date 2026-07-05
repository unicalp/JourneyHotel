#!/bin/bash

# Ensure Node is installed
if ! command -v node &> /dev/null
then
    echo "Node.js could not be found. Please install Node.js."
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building frontend and backend..."
npm run build

echo "Starting server..."
npm start -- "$@"
