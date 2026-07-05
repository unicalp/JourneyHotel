"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const minimist_1 = __importDefault(require("minimist"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const argv = (0, minimist_1.default)(process.argv.slice(2));
const mapFilePath = argv.map || 'map.ascii';
const bookingsFilePath = argv.bookings || 'bookings.json';
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// In-memory state for booked cabanas
const bookedCabanas = new Set(); // Format: "x,y"
// Read configuration files
function readMap(filepath) {
    try {
        const content = fs_1.default.readFileSync(path_1.default.resolve(process.cwd(), filepath), 'utf-8');
        return content.split(/\r?\n/).filter(line => line.trim().length > 0);
    }
    catch (err) {
        console.error(`Failed to read map file at ${filepath}:`, err);
        process.exit(1);
    }
}
function readBookings(filepath) {
    try {
        const content = fs_1.default.readFileSync(path_1.default.resolve(process.cwd(), filepath), 'utf-8');
        return JSON.parse(content);
    }
    catch (err) {
        console.error(`Failed to read bookings file at ${filepath}:`, err);
        process.exit(1);
    }
}
const mapLayout = readMap(mapFilePath);
const guests = readBookings(bookingsFilePath);
app.get('/api/map', (req, res) => {
    res.json({
        layout: mapLayout,
        bookedCabanas: Array.from(bookedCabanas),
    });
});
app.post('/api/cabanas/book', (req, res) => {
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
app.use(express_1.default.static(path_1.default.resolve(__dirname, '../../frontend/dist')));
// Fallback to index.html for SPA routing (though we don't have routing yet, good practice)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path_1.default.resolve(__dirname, '../../frontend/dist/index.html'));
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
exports.default = app;
