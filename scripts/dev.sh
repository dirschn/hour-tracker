#!/bin/bash
# Development script to run both Rails backend and Angular frontend using run-pty

echo "🚀 Starting Hour Tracker Development Environment"
echo "================================================"
echo ""
echo "🔵 Backend:  http://localhost:3000"
echo "🟢 Frontend: http://localhost:4200"
echo ""
echo "Keyboard shortcuts:"
echo "  [Ctrl+Z] - Dashboard to switch between servers"
echo "  [Ctrl+C] - Kill all servers"
echo ""

# Use run-pty with the JSON configuration file
npx run-pty run-pty.json
