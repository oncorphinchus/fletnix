# Fletnix Frontend

This is the frontend for the Fletnix application, built with Next.js and TailwindCSS.

## Features

- Modern and responsive UI with dark mode support
- User authentication (login, registration)
- Browse media content
- Media details and playback
- Personal watchlist
- Search functionality
- History tracking

## Prerequisites

- Node.js 14+ and npm/yarn
- Backend API running (see backend directory)

## Getting Started

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm start
# or
yarn start
```

## Docker

You can also run the frontend using Docker:

```bash
docker build -t fletnix-frontend .
docker run -p 3000:3000 fletnix-frontend
```

## Project Structure

- `components/` - Reusable UI components
- `lib/` - Utility functions and hooks
- `pages/` - Next.js pages (routes)
- `public/` - Static assets
- `styles/` - Global styles and TailwindCSS configuration
- `types/` - TypeScript type definitions

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [SWR](https://swr.vercel.app/)
- [React Icons](https://react-icons.github.io/react-icons/)

## License

This project is proprietary. 