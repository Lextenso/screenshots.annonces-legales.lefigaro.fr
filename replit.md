# Overview

This is a web application for capturing screenshots of Le Figaro newspaper articles from specific French departments over a 7-week period. The application automates the process of fetching article URLs from an external API, taking screenshots using shot-scraper, creating a ZIP archive, and uploading it to an SFTP server. Built with a React frontend and Express backend, it provides a guided workflow with real-time progress updates.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React with TypeScript, using Vite as the build tool and development server.

**UI Framework**: Radix UI components with shadcn/ui styling system, utilizing Tailwind CSS for utility-first styling with a custom design system defined through CSS variables.

**State Management**: 
- React Query (@tanstack/react-query) for server state management and API calls
- React Hook Form with Zod validation for form handling
- Local component state for UI flow management

**Routing**: Wouter for lightweight client-side routing

**Design Pattern**: The frontend follows a step-based wizard pattern with five distinct stages:
1. Selection (department and date selection)
2. Confirmation (article count verification)
3. Progress (real-time screenshot capture updates)
4. Success (completion summary with download link)
5. Error (error handling and retry options)

The progress screen uses Server-Sent Events (SSE) to receive real-time updates from the backend during the capture process.

## Backend Architecture

**Framework**: Express.js with TypeScript, using ES modules

**Development Setup**: 
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves pre-built static assets
- Custom logging middleware for API request tracking

**Service Layer Pattern**: Business logic is separated into three main services:
- **FigaroApiService**: Fetches and filters article data from external API
- **ScreenshotService**: Manages screenshot capture using shot-scraper CLI tool
- **SftpService**: Handles secure file uploads to remote server

**API Endpoints**:
- `POST /api/articles/count`: Returns article count for validation
- `POST /api/capture/start`: Initiates capture process with SSE for progress updates

**Process Management**: Screenshot capture runs as spawned child processes using Node's `child_process.spawn`, with parallel execution for efficiency and event-based progress reporting.

## Data Storage Solutions

**Database**: PostgreSQL via Neon Database serverless driver (@neondatabase/serverless)

**ORM**: Drizzle ORM for type-safe database queries and schema management
- Schema defined in `shared/schema.ts`
- Migrations stored in `./migrations` directory
- Push-based deployment with `drizzle-kit push`

**File Storage**: 
- Local filesystem for temporary screenshot storage in `screenshots/` directory
- ZIP archive creation using archiver library
- Final storage on remote SFTP server organized by year

**Session Storage**: Connection pooling handled by Drizzle with Neon's serverless driver

## Authentication and Authorization

**Current Implementation**: No authentication system is currently implemented. The application operates as a trusted internal tool.

**Security Considerations**: 
- SFTP credentials stored in environment variables
- No user accounts or session management
- Direct API access without authentication tokens

## External Dependencies

**Third-Party APIs**:
- **Le Figaro API** (`https://infoslocales.ccmbg.com/export.php`): JSON endpoint providing article URLs and dates by department number

**External Tools**:
- **shot-scraper**: Python-based CLI tool for browser automation and screenshot capture
  - Requires installation via `pip install shot-scraper && shot-scraper install`
  - Uses custom JavaScript injection to hide page elements (ads, newsletter boxes, footers)
  - Configured with 1030px width for consistent screenshot dimensions
  - **Note**: Requires Playwright system dependencies (libnspr4, libnss3, etc.) which may not be available in all Replit environments
  - Uses `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true` to bypass validation checks

**SFTP Server Integration**:
- Connection via ssh2-sftp-client library
- Configuration through environment variables:
  - `SFTP_SERVEUR` or `SFTP_SERVER`: Server hostname
  - `SFTP_LOGIN` or `SFTP_USERNAME`: Authentication username
  - `SFTP_PASSWORD`: Authentication password
  - `SFTP_DIRECTORY`: Base upload directory (defaults to `/uploads`)
- Files organized in year-based subdirectories
- Download URLs follow pattern: `https://habilitations.annonces-legales.lefigaro.fr/?[DEPARTMENT_NUMBER]`

**Database Service**:
- Neon Database (serverless PostgreSQL)
- Connection via `DATABASE_URL` environment variable

**Development Tools**:
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- ESBuild for server-side bundling in production

**Date Handling**: date-fns library for parsing, formatting, and date range calculations (7-week periods)

**Validation**: Zod for runtime type checking and schema validation across frontend and backend (shared schemas)