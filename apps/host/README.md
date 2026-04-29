# XBit Web App

## Tech Stack

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Redux Toolkit](https://redux-toolkit.js.org/) - The official, opinionated, batteries-included toolset for efficient Redux development
- [GraphQL](https://graphql.org/) - A query language for APIs
- [MQTT](https://mqtt.org/) - A lightweight messaging protocol
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [React Query](https://tanstack.com/query/latest) - Powerful asynchronous state management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- yarn

### Installation

1. Clone the repository
```bash
git clone https://gitlab.ggwp.life/xbit/xbit-app/xbit-app-web.git
# or
git clone git@gitlab.ggwp.life:xbit/xbit-app/xbit-app-web.git
cd xbit-app-web
```

2. Install dependencies
```bash
yarn install
```

3. Start the development server
```bash
yarn dev
```

## Project Structure

```bash
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable components
├── config/          # Configuration files
├── graphql/         # GraphQL queries and mutations
├── hooks/           # Custom React hooks
├── lib/             # Third-party library configurations
├── pages/           # Page components
├── services/        # API and external service integrations
├── store/           # Redux store configuration
├── styles/          # Global styles and theme
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and constants
```

## Coding Conventions

Please refer to our [Coding Conventions](coding-conventions.md) document for detailed guidelines on:

- Project structure and organization
- Naming conventions
- TypeScript best practices
- React component patterns
- State management
- Styling guidelines
- Data management
- Code quality standards
- Testing practices
- Git workflow
