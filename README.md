# Time Score
<!-- TODO -->

## 🛠 Technologies

### Frontend
- Next.js 15 (App Router)
- TypeScript 5
- TailwindCSS 4 (Latest)
- Shadcn UI
- Swagger UI

### Backend & Database
- Nextjs API Routes & Server Action
- Prisma ORM
- Supabase Auth & PostgreSQL & Realtime

### Development Tools
- Dev Containers
- Format & Linting
- Pre-commit hooks
- Semantic Release
- Some rules & memory for Cline, RooCode

## Core Features
<!-- TODO -->

## Getting Started

### Option 1: Development Container (Recommended)

Choose your preferred Development Container environment:

[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/holedev/nextjs-faster)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=holedev/nextjs-faster)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/holedev/nextjs-faster)

This automatically sets up your development environment with all dependencies installed. Remember setup your environment variables based on the platform you choose.

### Option 2: Local Development

```bash
git clone `url`
cd folder

# use correct version node (optional)
nvm use

# use correct version pnpm (optional)
corepack enable pnpm

# setup environment variables
cp .env.example .env

# install dependencies
pnpm i

# dev
pnpm dev
```

### Docker
```bash
docker compose up
```


## 📁 Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API endpoints
│   └── api-docs/       # Swagger UI
├── components/         # React components
│   ├── custom/        # Project components
│   └── ui/            # Shadcn UI components
└── configs/           # Configuration
    ├── data/         # Sample data
    ├── prisma/       # Database schema
    ├── supabase/     # Auth config
    └── swagger/      # API documentation
```
