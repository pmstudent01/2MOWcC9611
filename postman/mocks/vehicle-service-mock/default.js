const http = require('http');
const PORT = process.env.PORT || 4500;

// Namespace prefix for pm.state keys
const NS = 'vehicle-service:';

// Seed initial vehicles into pm.state if not already present
async function ensureSeeded() {
  const initialized = await pm.state.get(NS + 'initialized');
  if (!initialized) {
    const seed = [
      { id: 1, nickName: 'The Lisa Marie', vin: '4M2DV11W4RDJ53329', make: 'Mercury', model: 'Villager', year: '1994', miles: 159864 },
      { id: 2, nickName: 'Dolly', vin: 'JN8AZ2KR1AT169594', make: 'Nissan', model: 'Cube', year: '2010', miles: 59000 }
    ];
    await pm.state.set(NS + 'vehicles', seed);
    await pm.state.set(NS + 'nextId', 3);
    await pm.state.set(NS + 'initialized', true);
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function formatMiles(miles) {
  if (typeof miles === 'number') {
    return miles.toLocaleString('en-US');
  }
  return String(miles);
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  try {
    await ensureSeeded();

    // Route: GET /vehicles
    // @endpoint GET /vehicles
    if (method === 'GET' && url === '/vehicles') {
      const vehicles = await pm.state.get(NS + 'vehicles') || [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(vehicles));
      return;
    }

    // Route: POST /vehicles
    // @endpoint POST /vehicles
    if (method === 'POST' && url === '/vehicles') {
      let body;
      try { body = await parseBody(req); }
      catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        return;
      }

      const { nickName, vin, make, model, year, miles } = body;
      if (!nickName || !vin || !make || !model || !year) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required attribute', required: ['nickName', 'vin', 'make', 'model', 'year'] }));
        return;
      }

      const vehicles = await pm.state.get(NS + 'vehicles') || [];
      const duplicate = vehicles.find(v => v.vin === vin);
      if (duplicate) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Vehicle already exists', vin }));
        return;
      }

      const nextId = await pm.state.get(NS + 'nextId') || (vehicles.length + 1);
      const newVehicle = {
        id: nextId,
        nickName,
        vin,
        make,
        model,
        year: String(year),
        miles: formatMiles(miles !== undefined ? miles : 0)
      };
      vehicles.push(newVehicle);
      await pm.state.set(NS + 'vehicles', vehicles);
      await pm.state.set(NS + 'nextId', nextId + 1);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newVehicle));
      return;
    }

    // Routes for /vehicles/:id
    const idMatch = url.match(/^\/vehicles\/(\d+)$/);
    if (idMatch) {
      const id = parseInt(idMatch[1], 10);

      // @endpoint GET /vehicles/:id
      if (method === 'GET') {
        const vehicles = await pm.state.get(NS + 'vehicles') || [];
        const vehicle = vehicles.find(v => v.id === id);
        if (!vehicle) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Vehicle not found', id }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(vehicle));
        return;
      }

      // @endpoint PATCH /vehicles/:id
      if (method === 'PATCH') {
        let body;
        try { body = await parseBody(req); }
        catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          return;
        }

        const vehicles = await pm.state.get(NS + 'vehicles') || [];
        const idx = vehicles.findIndex(v => v.id === id);
        if (idx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Vehicle not found', id }));
          return;
        }

        const updated = Object.assign({}, vehicles[idx], body, { id });
        if (body.miles !== undefined) {
          updated.miles = typeof body.miles === 'number' ? body.miles : body.miles;
        }
        vehicles[idx] = updated;
        await pm.state.set(NS + 'vehicles', vehicles);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updated));
        return;
      }

      // @endpoint DELETE /vehicles/:id
      if (method === 'DELETE') {
        const vehicles = await pm.state.get(NS + 'vehicles') || [];
        const idx = vehicles.findIndex(v => v.id === id);
        if (idx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Vehicle not found', id }));
          return;
        }
        vehicles.splice(idx, 1);
        await pm.state.set(NS + 'vehicles', vehicles);

        res.writeHead(204);
        res.end();
        return;
      }
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Mock route not defined', method, url }));

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unexpected error', message: err.message }));
  }
});

server.listen(PORT, () => console.log('Vehicle Service Mock running on port ' + PORT));
