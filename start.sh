#!/bin/bash

echo "🏪 Starting RetailHub Management System..."
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Starting server..."
echo "✅ Server will be available at: http://localhost:3001"
echo ""

node server.js
