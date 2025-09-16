#!/bin/bash

# Test Trade API Endpoints
BASE_URL="http://localhost:2000/api"

echo "Testing Trade API Endpoints..."
echo "=============================="

# Test 1: Get Available Teams
echo -e "\n1. Testing GET /api/trades/available-teams"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/trades/available-teams"

# Test 2: Get Available Destinations
echo -e "\n2. Testing GET /api/trades/available-destinations"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/trades/available-destinations"

# Test 3: List Trades
echo -e "\n3. Testing GET /api/trades"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/trades"

# Test 4: Get Trade Details (with fake ID)
echo -e "\n4. Testing GET /api/trades/{id}"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/trades/test-trade-id"

echo -e "\n=============================="
echo "API Endpoint Test Complete"
echo ""
echo "Note: 401/403 = Authentication required"
echo "      404 = Endpoint not found"
echo "      200 = Success"