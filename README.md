
# Sistema de Chats

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.0.0-orange.svg)

A real-time chat application built with React, TypeScript, and a modern tech stack.

## Table of Contents

- [Sistema de Chats](#sistema-de-chats)
  - [Table of Contents](#table-of-contents)
  - [About The Project](#about-the-project)
    - [Features](#features)
  - [Built With](#built-with)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## About The Project

This project is a real-time chat application that allows users to communicate with each other in channels. It features a modern and responsive user interface built with Shadcn/UI and Tailwind CSS. The application is built with a focus on performance, scalability, and maintainability.

### Features

- Real-time messaging with Socket.io
- Channel-based communication
- User authentication
- Responsive design for mobile and desktop
- Theme switching (light/dark mode)
- And more!

## Built With

This project is built with a modern tech stack that includes:

- **[React](https://reactjs.org/)**: A JavaScript library for building user interfaces.
- **[TypeScript](https://www.typescriptlang.org/)**: A typed superset of JavaScript that compiles to plain JavaScript.
- **[Vite](https://vitejs.dev/)**: A fast build tool and development server.
- **[Shadcn/UI](https://ui.shadcn.com/)**: A collection of re-usable components built with Radix UI and Tailwind CSS.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework.
- **[Zustand](https://zustand-demo.pmnd.rs/)**: A small, fast and scalable bearbones state-management solution.
- **[React Hook Form](https://react-hook-form.com/)**: Performant, flexible and extensible forms with easy-to-use validation.
- **[Axios](https://axios-http.com/)**: A promise-based HTTP client for the browser and Node.js.
- **[Socket.io](https://socket.io/)**: A library for real-time, bidirectional and event-based communication.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Running with Docker (recommended)

The whole stack (Postgres + API + this front-end) runs from the docker-compose in the API repository. Clone both repositories side by side (`chat-sys/api` and `chat-sys/web`) and run:

```bash
cd ../api
docker compose up --build -d
```

The app will be available at http://localhost:8080 with hot reload.

### Prerequisites

Make sure you have the following software installed on your machine:

- [Node.js](https://nodejs.org/) (v22 or higher)
- [pnpm](https://pnpm.io/) (v9) — the project uses `pnpm-lock.yaml`; other package managers are not supported

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Guribeiro/chat-sys-web.git
   ```
2. Install the dependencies
   ```sh
   pnpm install
   ```
3. Create a `.env.local` file in the root of the project and add the necessary environment variables. You can use `.env.local.example` as a template.

4. Start the development server
   ```sh
   pnpm dev
   ```

## Available Scripts

In the project directory, you can run:

- `pnpm dev`: Runs the app in the development mode.
- `pnpm build`: Builds the app for production to the `dist` folder.
- `pnpm build:dev`: Builds the app for development to the `dist` folder.
- `pnpm lint`: Lints the code using ESLint.
- `pnpm preview`: Serves the production build locally for preview.

## Project Structure

The project structure is organized as follows:

```
.
├── public
├── src
│   ├── assets
│   ├── components
│   ├── hooks
│   ├── http
│   ├── lib
│   ├── pages
│   ├── routes
│   ├── schemas
│   ├── socket
│   └── store
├── .env.local.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.ts
```

- **`public`**: Contains static assets that are not processed by Vite.
- **`src`**: Contains the main source code of the application.
  - **`assets`**: Contains static assets like images and fonts.
  - **`components`**: Contains reusable UI components.
  - **`hooks`**: Contains custom React hooks.
  - **`http`**: Contains functions for making HTTP requests to the API.
  - **`lib`**: Contains utility functions.
  - **`pages`**: Contains the main pages of the application.
  - **`routes`**: Contains the routing configuration.
  - **`schemas`**: Contains Zod schemas for data validation.
  - **`socket`**: Contains the Socket.io client configuration.
  - **`store`**: Contains the Zustand store for state management.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m '''Add some AmazingFeature'''`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Gustavo Ribeiro - [@guribeir](https://twitter.com/guribeir) - guribeirodeveloper@gmail.com

Project Link: [https://github.com/Guribeiro/chat-sys-web](https://github.com/Guribeiro/chat-sys-web)
