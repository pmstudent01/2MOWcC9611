"""Vehicle Service API.

A FastAPI implementation of the Vehicle Service, mirroring the behavior of the
Postman stateful mock handler (postman/mocks/vehicle-service-mock/default.js).

State is kept in-memory (a simple list + a next-id counter), seeded with two
vehicles. Error shapes and status codes match the mock contract exactly.
"""

from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Vehicle Service API", version="1.0.0")

# ---------------------------------------------------------------------------
# In-memory state (seeded)
# ---------------------------------------------------------------------------
SEED_VEHICLES: List[Dict[str, Any]] = [
    {
        "id": 1,
        "nickName": "The Lisa Marie",
        "vin": "4M2DV11W4RDJ53329",
        "make": "Mercury",
        "model": "Villager",
        "year": "1994",
        "miles": 159864,
    },
    {
        "id": 2,
        "nickName": "Dolly",
        "vin": "JN8AZ2KR1AT169594",
        "make": "Nissan",
        "model": "Cube",
        "year": "2010",
        "miles": 59000,
    },
]

vehicles: List[Dict[str, Any]] = [dict(v) for v in SEED_VEHICLES]
next_id: int = 3

REQUIRED_FIELDS = ["nickName", "vin", "make", "model", "year"]


# ---------------------------------------------------------------------------
# Pydantic models (documentation / OpenAPI)
# ---------------------------------------------------------------------------
class VehicleCreate(BaseModel):
    nickName: str
    vin: str
    make: str
    model: str
    year: str
    miles: Optional[int] = 0


class VehicleUpdate(BaseModel):
    nickName: Optional[str] = None
    vin: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[str] = None
    miles: Optional[int] = None


class Vehicle(BaseModel):
    id: int
    nickName: str
    vin: str
    make: str
    model: str
    year: str
    miles: Any


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/vehicles")
async def list_vehicles():
    return JSONResponse(status_code=200, content=vehicles)


@app.post("/vehicles")
async def create_vehicle(request: Request):
    global next_id

    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON body"})

    if not isinstance(body, dict):
        return JSONResponse(status_code=400, content={"error": "Invalid JSON body"})

    # Manual required-field validation (match mock: 400, not FastAPI's 422)
    missing = any(not body.get(field) for field in REQUIRED_FIELDS)
    if missing:
        return JSONResponse(
            status_code=400,
            content={"error": "Missing required attribute", "required": REQUIRED_FIELDS},
        )

    vin = body["vin"]
    if any(v["vin"] == vin for v in vehicles):
        return JSONResponse(
            status_code=409,
            content={"error": "Vehicle already exists", "vin": vin},
        )

    miles = body.get("miles")
    new_vehicle = {
        "id": next_id,
        "nickName": body["nickName"],
        "vin": vin,
        "make": body["make"],
        "model": body["model"],
        "year": str(body["year"]),
        "miles": miles if miles is not None else 0,
    }
    vehicles.append(new_vehicle)
    next_id += 1

    return JSONResponse(status_code=201, content=new_vehicle)


@app.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: int):
    vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
    if vehicle is None:
        return JSONResponse(
            status_code=404,
            content={"error": "Vehicle not found", "id": vehicle_id},
        )
    return JSONResponse(status_code=200, content=vehicle)


@app.patch("/vehicles/{vehicle_id}")
async def update_vehicle(vehicle_id: int, request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON body"})

    if not isinstance(body, dict):
        return JSONResponse(status_code=400, content={"error": "Invalid JSON body"})

    idx = next((i for i, v in enumerate(vehicles) if v["id"] == vehicle_id), -1)
    if idx == -1:
        return JSONResponse(
            status_code=404,
            content={"error": "Vehicle not found", "id": vehicle_id},
        )

    updated = {**vehicles[idx], **body, "id": vehicle_id}
    vehicles[idx] = updated
    return JSONResponse(status_code=200, content=updated)


@app.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: int):
    idx = next((i for i, v in enumerate(vehicles) if v["id"] == vehicle_id), -1)
    if idx == -1:
        return JSONResponse(
            status_code=404,
            content={"error": "Vehicle not found", "id": vehicle_id},
        )
    vehicles.pop(idx)
    return Response(status_code=204)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
