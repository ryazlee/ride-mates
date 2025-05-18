# Ride Mates

Hello! welcome to the Ride Mates repo! This app was made by [@ryazlee](https://github.com/ryazlee) with the purpose to reduce rideshare costs with peers.

To learn more, read the info below or contact [ryan](mailto:ryan.j.lee99@gmail.com)

## Tech Stack

### Frontend: React + TypeScript + Vite

Not too much thought was put into making the frontend... the main goal was to:

1. Build something fast
2. Build something easy to use
3. Build something that works

All of these goals were accomplished with React + TypeScript + Vite. The frontend is a single page app that uses TypeScript for type safety. The app is built with Vite, which is a fast and lightweight build tool that allows for quick development and deployment. If the use case expands in the future,
I may need to reconsider the tech stack, but for now, this is a great solution.

### Backend: Node + Express + WebSockets

The backend is built with Node + Express + WebSockets. This app uses very simple REST APIs to handle the basic functionality, where most of the heavy lifting is done by the web sockets.

### Starting the App

1. Clone the repo
2. Install the dependencies

```bash
yarn install
cd backend/ && yarn install
```

3. Start the frontend

```bash
cd ..
yarn dev
```

4. Start the backend

```bash
cd backend/
yarn dev
```

5. Open the app in your browser

# Production: <https://ride-mates-one.vercel.app/>

## Frontend: Vercel

The frontend is hosted on [Vercel](https://vercel.com/ryans-projects-85afbc4f/ride-mates). The app gets rebuilt on every commit to the main branch.

## Backend: Render

The backend is hosted on [Render](https://dashboard.render.com/project/prj-d0l1l93e5dus73c75200). The app gets rebuilt on every commit to the main branch. Right now, the app is hosted on the free service, but this may change in the future.
