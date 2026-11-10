# 🚗🌌 Vehicle Service API

> *From API contract to running service — your mission, should you choose to accept it.*

![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![REST](https://img.shields.io/badge/REST-API-orange?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

<p align="center">
  <img src="https://voyager.postman.com/illustration/postman-galaxy-illustration.svg" 
       alt="Postman Galaxy" 
       width="480"
       onerror="this.style.display='none'"/>
</p>

---

## 🛸 Overview

This repository is your launchpad for learning how modern APIs are designed, documented, and built. It contains a **Postman Collection** that acts as the single source of truth — the *API design contract* — for a RESTful Vehicle Service. Your goal is to study that contract and implement a working service that satisfies it.

The collection defines the full lifecycle of a `vehicle` resource:

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| Create | `POST` | `/vehicles` | Register a new vehicle |
| Retrieve all | `GET` | `/vehicles` | List all vehicles |
| Retrieve one | `GET` | `/vehicles/:id` | Fetch a single vehicle by ID |
| Update | `PATCH` | `/vehicles/:id` | Modify a vehicle's attributes |
| Delete | `DELETE` | `/vehicles/:id` | Remove a vehicle from the system |

Authentication is handled via **JWT Bearer tokens** (HS256 algorithm). All required token details — including the signing secret and sample payload — are embedded in the collection's authorization configuration.

---

## 📂 Repository Structure

```
.
├── postman/
│   └── Vehicle_Service_Collection_postman_collection.json   # API design contract
├── app/
│   └── ...                                                  # Your Python implementation lives here
└── README.md
```

> The `app/` directory is where you will build your implementation. Its contents are intentionally left open — the collection defines *what* the service must do; how you build it is up to you.

---

## 🗺️ The API Contract

The Postman Collection is the authoritative specification for this project. It contains:

- **Request definitions** — HTTP methods, URL paths, headers, and body schemas
- **Example responses** — both successful outcomes and error cases, with appropriate HTTP status codes
- **Authentication config** — a pre-configured JWT setup you can use against your running service
- **Environment variable** — `{{baseUrl}}` which you will point at your locally running service

Treat the collection the way an engineer treats an OpenAPI spec: your implementation is correct when all requests in the collection return responses that match the documented examples.

### Response Codes to Implement

| Code | Meaning |
|------|---------|
| `200 OK` | Successful retrieval |
| `201 Created` | Vehicle successfully created |
| `204 No Content` | Vehicle successfully deleted |
| `400 Bad Request` | Missing or invalid request attribute |
| `404 Not Found` | Vehicle ID does not exist |
| `409 Conflict` | A vehicle with the same VIN already exists |
| `500 Internal Server Error` | Unexpected server-side failure |

---

## 🔐 Authentication

All endpoints are protected by **API Key** authentication. The API Key must be handled securely, never stored plaintext in the contents of this repo.

---

## 🚀 Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) (desktop agent recommended)
- Python 3.x
- Basic familiarity with REST APIs and HTTP

### Workflow

1. **Import the collection** into Postman and explore each request, its expected body, and its documented responses.
2. **Set up your environment** in Postman — create a new Environment and define `baseUrl` to point at your local server (e.g., `http://localhost:5000`).
3. **Build your service** in the `app/` directory. Use an LLM agent or your preferred tooling — the collection is a great prompt artifact.
4. **Run the collection** against your running service and verify that each request returns the expected response.

---

## 🤖 Using an LLM Agent

A core goal of this project is hands-on practice going **from API design to implementation with the help of an AI coding agent**. The Postman Collection is an excellent input for an agent — it precisely describes resources, methods, payloads, and expected behavior.

Some things worth exploring as you work:

- How well does the agent interpret the collection as a specification?
- What do you need to provide beyond the collection to get a useful result?
- How do you validate that the generated code actually satisfies the contract?
- What happens when the agent makes assumptions the collection leaves open?

There are no prescribed steps here — experimentation and reflection are part of the learning.

---

## 📬 Working with the Collection in Postman

<p align="center">
  <img src="https://voyager.postman.com/illustration/postman-loves-your-workflow-illustration.svg"
       alt="Postman workflow illustration"
       width="420"
       onerror="this.style.display='none'"/>
</p>

Postman makes it easy to explore the contract before you write a single line of code:

- Use the **Examples** saved on each request to understand expected inputs and outputs
- Use the **Mock Server** feature to simulate the API before your implementation is ready
- Use **Collection Runner** to execute all requests in sequence against your live service
- Use the built-in **Authorization** tab to inspect the JWT configuration

---

## 🌌 Vehicle Data Model

Each vehicle resource contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Auto-assigned unique identifier |
| `nickName` | string | A friendly name for the vehicle |
| `vin` | string | Vehicle Identification Number (must be unique) |
| `make` | string | Manufacturer (e.g., `Mercury`, `Nissan`) |
| `model` | string | Model name (e.g., `Villager`, `Cube`) |
| `year` | string | Model year |
| `miles` | integer | Current odometer reading |

The `vin` field serves as the natural uniqueness constraint — the service must reject attempts to register a duplicate VIN.

---

## 📚 Resources

- [Postman Learning Center](https://learning.postman.com/)
- [Postman Collection Format Docs](https://learning.postman.com/collection/v2.1.0/)
- [JWT Introduction](https://jwt.io/introduction)
- [HTTP Status Codes Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

<p align="center">
  <em>The road ahead is yours to navigate. Fire up your engines. 🚗💨🌌</em>
</p>
