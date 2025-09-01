# Medic Project

A Next.js medical application with PostgreSQL database.

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: TanStack Query + tRPC
- **Validation**: Zod
- **Linting**: Biome

## Development Commands

- `bun run dev` - Start development server with Turbo
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run typecheck` - Run TypeScript checks
- `bun run check` - Run Biome linter/formatter
- `bun run check:write` - Run Biome with auto-fix
- `bun run preview` - Build and start locally
- `bun run test` - Run tests with Bun

## Database Commands

- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema changes
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:seed` - Run database seeding
- `bun run db:seed-fake` - Seed with fake data

## Docker

- PostgreSQL runs on port 5432
- App runs on port 3000
- Use `docker-compose up` to start services

## Project Structure

- Built with T3 stack (Next.js, TypeScript, Tailwind, tRPC)
- Uses Drizzle for database management
- Authentication handled by NextAuth.js
- UI components from Radix UI
