#!/bin/bash

# Development Helper Script for Next.js HMR Issues

echo "🔧 Next.js Development Helper"
echo "=============================="

case "$1" in
  "clean")
    echo "🧹 Cleaning build cache..."
    rm -rf .next
    rm -f tsconfig.tsbuildinfo
    echo "✅ Cache cleared!"
    ;;
  "restart")
    echo "🔄 Restarting development server..."
    pkill -f "next dev"
    sleep 2
    rm -rf .next
    rm -f tsconfig.tsbuildinfo
    echo "🚀 Starting clean development server..."
    pnpm dev
    ;;
  "turbo")
    echo "🚀 Starting development server with Turbo..."
    rm -rf .next
    rm -f tsconfig.tsbuildinfo
    pnpm dev:clean
    ;;
  *)
    echo "Usage: ./dev-helper.sh [clean|restart|turbo]"
    echo ""
    echo "Commands:"
    echo "  clean   - Clear Next.js cache"
    echo "  restart - Kill and restart dev server with clean cache"
    echo "  turbo   - Start dev server with Turbo mode and clean cache"
    ;;
esac