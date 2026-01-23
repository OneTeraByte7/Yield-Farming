# Yield-Farming
<img width="1024" height="443" alt="image" src="https://github.com/user-attachments/assets/8358f191-2ece-4ae0-afe0-211f3b56259b" />

> A modular yield-farming dashboard and backend toolkit with a React + Vite frontend and a TypeScript Node server. Includes an AML fraud detector demo and integrations for wallets, pools, staking and strategy tools.

## Badges

<!-- Shields: replace `OneTeraByte7/Yield-Farming` with your org/repo if different -->
![GitHub stars](https://img.shields.io/github/stars/OneTeraByte7/Yield-Farming?style=social)
![Forks](https://img.shields.io/github/forks/OneTeraByte7/Yield-Farming)

![Top language](https://img.shields.io/github/languages/top/OneTeraByte7/Yield-Farming)
![Language: TypeScript](https://img.shields.io/badge/language-TypeScript-blue?logo=typescript)
![License](https://img.shields.io/github/license/OneTeraByte7/Yield-Farming)

![Last commit](https://img.shields.io/github/last-commit/OneTeraByte7/Yield-Farming)
![Open issues](https://img.shields.io/github/issues/OneTeraByte7/Yield-Farming)
![Open PRs](https://img.shields.io/github/issues-pr/OneTeraByte7/Yield-Farming)

![Status](https://img.shields.io/badge/status-active-brightgreen)

*(Tip: replace the GitHub Actions workflow filename `ci.yml` with your actual workflow file if different.)*

## Trophies

- 🏆 Active development: Regular updates and modular design
- ⚙️ Tech stack: `React`, `Vite`, `TypeScript`, `Node.js`, `Python (demo)`
- 🔒 Ready for integration: Supabase and wallet adapters included


## Key Features
- Modern frontend: React + Vite + TypeScript
- Backend: TypeScript Node server with API controllers and routes
- Wallet, pools, stake, strategy modules and hooks
- AML fraud detector demo (Python backend + small frontend)
- Organized services, controllers and reusable adapters

## Repository Layout

- `client/` — frontend app (React + Vite, TypeScript)
  - `src/` — application source (components, pages, hooks, api)
  - `public/` — static assets and `aml-fraud-detector` frontend
  - `aml-fraud-detector/` — separate demo (README inside)
- `server/` — TypeScript Node server
  - `src/` — server entry and API modules (controllers, routes, services)
  - `config/` — environment and Supabase config
  - `jobs/`, `middleware/`, `database/` — supporting code
- `package.json` — root scripts and workspace-level config

## Requirements
- Node.js (16+ recommended)
- npm or yarn
- Python 3.8+ (only if you run the AML fraud detector Python demo)

## Local Development

From the repo root you can install dependencies and run client and server independently.

Install all dependencies (root, client, server):

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Run the frontend (development):

```bash
npm --prefix client run dev
```

Run the backend server (development):

```bash
npm --prefix server run dev
```

Notes on environment configuration
- The server reads configuration from `server/config/env.ts` and `server/cdp_api_key.json` is included for local keys. Create a `.env` or update the config files with your Supabase and API keys as needed.
- If you run the AML fraud detector demo, see `client/aml-fraud-detector/README.md` and `client/aml-fraud-detector/backend/requirements.txt` for Python deps.

## Build for Production

Build the frontend:

```bash
npm --prefix client run build
```

Build or prepare the server according to `server/package.json` scripts (usually a `build` or `start` script).

Deployment notes
- The frontend contains a `vercel.json` and is compatible with static deployments (Vercel, Netlify, etc.).
- The server can be deployed to a Node host or serverless platform—ensure environment variables are set and any DB connections (Supabase) are configured.

## AML Fraud Detector (demo)
- Location: `client/aml-fraud-detector/` and `public/aml-fraud-detector/`.
- Backend (demo) lives under `client/aml-fraud-detector/backend/` and requires Python packages listed in `requirements.txt`.

## Testing
- No centralized test harness is included by default. Check `client/` and `server/` for local test scripts in their respective `package.json` files.

## Contributing
- Fork, create a branch, and open a pull request.
- Keep changes small and focused; update or add tests when applicable.

## Useful Commands

- Install deps: `npm install` (root) and `npm --prefix client install`, `npm --prefix server install`
- Start client: `npm --prefix client run dev`
- Start server: `npm --prefix server run dev`
- Build client: `npm --prefix client run build`

## Where to look next
- Frontend entry: `client/src/main.tsx`
- API adapters: `client/src/api` and `client/src/services`
- Server entry: `server/src/server.ts`
- Server routes and controllers: `server/src/routes`, `server/src/controllers`

## License
This repository does not include a license file. Add a `LICENSE` at the repo root if you intend to open-source the project.

---
If you want, I can also:
- add a short development checklist to `README.md`
- create a `Makefile` or root `scripts` to simplify common commands
- run a quick dependency audit and list missing scripts
