# AI Workflow Documentation

This project was developed with the assistance of an AI coding agent. The general workflow was as follows:

1. **Initial Assessment & Planning:**
   - Read and parsed the `README.md` to understand all requirements (single entrypoint, mapping tiles, TS/JS stack, in-memory state, specific map formats).
   - Designed a Monorepo architecture with a Node.js Express backend and a React/Vite frontend.
   - Wrote an Implementation Plan outlining the tech stack, API endpoints, testing strategy, and UI aesthetics.

2. **Project Scaffolding:**
   - Generated a root `package.json` for npm workspaces.
   - Initialized the React/Vite frontend and wrote the base configurations for the Node.js Express backend (including TS configuration).
   - Added standard dependencies (`cors`, `dotenv`, `express`, `vitest`, `jest`, etc.).

3. **Backend Implementation:**
   - Implemented `server.ts` to parse the CLI arguments (`--map`, `--bookings`) using `minimist`.
   - Built the file parsing logic for the `.ascii` and `.json` data files.
   - Implemented an in-memory `Set` for storing booked cabanas to meet the "no persistent storage" requirement.
   - Added validation logic matching user inputs with the imported JSON guest list.
   - Added the ability to serve the compiled static frontend files directly from the Express server.

4. **Frontend Implementation:**
   - Wrote `App.tsx` which fetches the map state and displays it in a CSS grid.
   - Wrote a responsive, aesthetically pleasing CSS design in `index.css` utilizing modern properties (filters, box-shadows, animations, and gradients) for a premium feel.
   - Mapped the ASCII characters to the provided PNG tiles.
   - Implemented the 1-step cabana booking modal with built-in validation error handling and state refresh.

5. **Testing & QA:**
   - Wrote backend unit tests using `Jest` and `Supertest` to validate the booking rules (available vs unavailable cabanas, valid vs invalid guests).
   - Wrote frontend component tests using `Vitest` and `React Testing Library` to verify the DOM rendering and modal interaction flows.

6. **Final Polish:**
   - Created the required `run.sh` entrypoint script.
   - Added `dotenv` configuration to allow optional use of `.env` files for deployment parameters like port configuration.
   - Generated this `AI.md` and updated the `README.md`.
