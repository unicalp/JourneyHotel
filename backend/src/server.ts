import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const argv = minimist(process.argv.slice(2));
const mapFilePath = argv.map || 'map.ascii';
const bookingsFilePath = argv.bookings || 'bookings.json';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory state for booked cabanas
const bookedCabanas = new Set<string>(); // Format: "x,y"

// Read configuration files
function readMap(filepath: string): string[] {
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), filepath), 'utf-8');
    return content.split(/\r?\n/).filter(line => line.trim().length > 0);
  } catch (err) {
    console.error(`Failed to read map file at ${filepath}:`, err);
    process.exit(1);
  }
}

function readBookings(filepath: string): Array<{ room: string; guestName: string }> {
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), filepath), 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to read bookings file at ${filepath}:`, err);
    process.exit(1);
  }
}

const mapLayout = readMap(mapFilePath);
const guests = readBookings(bookingsFilePath);

app.get('/api/map', (req: Request, res: Response) => {
  res.json({
    layout: mapLayout,
    bookedCabanas: Array.from(bookedCabanas),
  });
});

app.post('/api/cabanas/book', (req: Request, res: Response) => {
  const { x, y, room, guestName } = req.body;

  if (x === undefined || y === undefined || !room || !guestName) {
    return res.status(400).json({ error: 'Missing required fields: x, y, room, guestName' });
  }

  // Validate guest
  const isValidGuest = guests.some(g => g.room === String(room) && g.guestName === guestName);
  if (!isValidGuest) {
    return res.status(401).json({ error: 'Invalid room number or guest name.' });
  }

  // Validate cabana position exists
  if (y < 0 || y >= mapLayout.length || x < 0 || x >= mapLayout[y].length) {
    return res.status(400).json({ error: 'Invalid cabana coordinates.' });
  }

  if (mapLayout[y][x] !== 'W') {
    return res.status(400).json({ error: 'Selected coordinates do not contain a cabana.' });
  }

  const cabanaId = `${x},${y}`;
  if (bookedCabanas.has(cabanaId)) {
    return res.status(409).json({ error: 'This cabana is already booked.' });
  }

  bookedCabanas.add(cabanaId);
  return res.json({ success: true, message: 'Cabana booked successfully!', cabanaId });
});

// Serve frontend static files
app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));

// Fallback to index.html for SPA routing (though we don't have routing yet, good practice)
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log(`Using map file: ${mapFilePath}`);
    console.log(`Using bookings file: ${bookingsFilePath}`);
  });
}

export default app;
