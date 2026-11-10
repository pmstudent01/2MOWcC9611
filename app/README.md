# Vehicle Service API

A FastAPI + Uvicorn implementation of the Vehicle Service, mirroring the
behavior of the Postman stateful mock handler
(`postman/mocks/vehicle-service-mock/default.js`). State is kept in-memory and
seeded with two vehicles (ids `1` and `2`); newly created vehicles get an
auto-incrementing id starting at `3`.

## Install

From the repository root:

```bash
pip install -r requirements.txt
```

(Optionally create a virtual environment first: `python -m venv .venv` then
activate it.)

## Run

Either of the following works:

```bash
uvicorn app.main:app --reload
```

or

```bash
python app/main.py
```

The server listens on **http://localhost:8000**. Interactive API docs are
available at `http://localhost:8000/docs`.

## Endpoints

| Method | Path             | Success        | Notes                                                                 |
| ------ | ---------------- | -------------- | --------------------------------------------------------------------- |
| GET    | `/vehicles`      | `200` array    | Returns all vehicles.                                                 |
| POST   | `/vehicles`      | `201` vehicle  | Creates a vehicle. Required: `nickName`, `vin`, `make`, `model`, `year` (string). `miles` optional (defaults `0`). |
| GET    | `/vehicles/{id}` | `200` vehicle  | `404` if not found.                                                   |
| PATCH  | `/vehicles/{id}` | `200` vehicle  | Merges provided fields, keeps `id`. `404` if not found.               |
| DELETE | `/vehicles/{id}` | `204` no body  | `404` if not found.                                                   |

### Error shapes

- Missing required field (POST): `400 {"error":"Missing required attribute","required":["nickName","vin","make","model","year"]}`
- Duplicate `vin` (POST): `409 {"error":"Vehicle already exists","vin":"<vin>"}`
- Invalid JSON body (POST/PATCH): `400 {"error":"Invalid JSON body"}`
- Not found (GET/PATCH/DELETE): `404 {"error":"Vehicle not found","id":<id>}`

### Vehicle fields

`id` (int), `nickName` (str), `vin` (str), `make` (str), `model` (str),
`year` (str), `miles` (int, defaults `0`).

### Seed data

```json
[
  { "id": 1, "nickName": "The Lisa Marie", "vin": "4M2DV11W4RDJ53329", "make": "Mercury", "model": "Villager", "year": "1994", "miles": 159864 },
  { "id": 2, "nickName": "Dolly", "vin": "JN8AZ2KR1AT169594", "make": "Nissan", "model": "Cube", "year": "2010", "miles": 59000 }
]
```
