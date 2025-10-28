# Internal Team Dashboard with AI Assistant

A modern full-stack web application for internal teams to ask questions and get answers from an AI assistant, with the ability to save and organize Q&A pairs in a knowledge base.

## Setup Instructions

### Prerequisites

- Node.js >=20.9.0
- npm
- OpenAI API key
- Convex account

### Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Set Up Environment Variables**

Add your OpenAI API key to `.env.local`:

```
OPENAI_API_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

3. **Initialize Convex Database**

```bash
npx convex push
```

This will:

- Push the schema to your Convex deployment
- Generate TypeScript types for API functions

4. **Start Development Server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Push Convex schema
npx convex push

# View Convex dashboard
npx convex dashboard

# View Convex documentation
npx convex docs
```

## License

This project is part of the FT Media Coding Challenge.
