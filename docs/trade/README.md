# Trade System

## Overview

Ultra-simple trading between teams:
1. **Sender** offers items with a price
2. **Receiver** accepts and pays (items + transport)

## How It Works

### Sender Creates Trade
- Select multiple items from ONE facility
- Set total price for items
- Choose target team
- Send

### Receiver Accepts Trade
- Choose destination facility
- Pay for items + transportation
- Items transfer automatically

## Core Rules

- **Items**: Multiple items OK, must be from SAME facility
- **Transport**: RECEIVER always pays transportation
- **Payment**: Receiver pays = Item price + Transport cost
- **Delivery**: Instant transfer to chosen facility

## API Endpoints

### 1. Create Trade
```http
POST /api/trades
```
- Select items from one facility
- Set price
- Target specific team

### 2. List Trades
```http
GET /api/trades?type=incoming
```
- View incoming trade offers
- See item details and price

### 3. Preview Trade
```http
POST /api/trades/:id/preview
```
- Choose destination facility
- See transport cost
- Check total cost

### 4. Accept Trade
```http
POST /api/trades/:id/accept
```
- Specify destination facility
- Pay items + transport
- Receive items instantly

### 5. Reject/Cancel
- Reject incoming trades
- Cancel your pending trades

## Status Flow
```
PENDING → ACCEPTED → COMPLETED
        ↘ REJECTED
        ↘ CANCELLED
```

## Simple Example

1. Team A offers 100 iron ore for 5000 gold
2. Team B previews: 5000 (items) + 1000 (transport) = 6000 total
3. Team B accepts, pays 6000, receives items

## Key Points

- Sender: Just pick items and price
- Receiver: Pays everything (items + transport)
- Transport: Automatic calculation based on distance
- Delivery: Instant to chosen facility