from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
import os
from typing import List, Dict, Optional
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="api/static"), name="static")

KALSHI_API_BASE = "https://trading-api.kalshi.com/trade-api/v2"

@app.get("/api/markets")
async def get_markets(
    authorization: Optional[str] = Header(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(default=50, le=1000),
    cursor: Optional[str] = Query(None)
):
    headers = {
        "Authorization": authorization
    }
    
    params = {
        "limit": limit,
        "status": status,
        "category": category,
    }
    if cursor:
        params["cursor"] = cursor

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{KALSHI_API_BASE}/markets",
                headers=headers,
                params=params
            )
            if response.status_code == 200:
                return response.json()
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch markets")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/{ticker}")
async def get_market_details(
    ticker: str,
    authorization: Optional[str] = Header(None)
):
    headers = {
        "Authorization": authorization
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{KALSHI_API_BASE}/markets/{ticker}",
                headers=headers
            )
            if response.status_code == 200:
                return response.json()
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch market details")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def read_root():
    return {"message": "Welcome to Kalshi Markets API"} 