# RAMI

## Project structure

```
frontend/   React + TypeScript + Vite app (WFP design system)
backend/    Placeholder — backend does not exist yet
restart.sh  Stops and restarts both apps
```

## Prerequisites

- **Node 22** (see `frontend/.nvmrc`). If your system node is older, use nvm:

  ```sh
  export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"
  ```

- Install frontend dependencies once:

  ```sh
  cd frontend
  npm install
  ```

## Running the app

### Option 1: restart script (recommended)

From the repo root:

```sh
./restart.sh
```

This stops any running instances and starts them again in the background.
The frontend is served at <http://localhost:5173/>.

- Logs: `.run/frontend.log`
- PIDs: `.run/frontend.pid`

The backend section of the script is a placeholder and does nothing until
the backend exists.

To stop the app without restarting it:

```sh
kill -- -"$(cat .run/frontend.pid)" && rm .run/frontend.pid
```

### Option 2: run manually

```sh
cd frontend
npm run dev
```

Runs Vite in the foreground at <http://localhost:5173/> with hot reload.
Stop it with `Ctrl+C`.

## Other commands

Run these from the `frontend/` directory:

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run build`   | Type-check and build for production   |
| `npm run preview` | Serve the production build locally    |
| `npm run lint`    | Run ESLint                            |

## Backend

Not implemented yet. When it is added under `backend/`, update the
`start_backend` function in `restart.sh` (a commented-out template is
already there) and document the run steps here.
