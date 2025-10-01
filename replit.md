# Overview

This is a web application for capturing screenshots of Le Figaro newspaper articles from specific French departments over a 7-week period. The application automates the process of fetching article URLs from an external API, taking screenshots using shot-scraper, creating a ZIP archive, and uploading it to an SFTP server. Built with a React frontend and Express backend, it provides a guided workflow with real-time progress updates.

**Current Status**: Application is functionally complete with comprehensive resource management and cancellation handling. Ready for internal/controlled deployment. See Production Recommendations below for public deployment considerations.

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
  - `SFTP_PORT`: Server port (defaults to 22 if not specified)
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

# Recent Changes

## 2025-10-01: Resource Management and Cancellation Improvements

**Problem Addressed**: The application needed robust cancellation handling, resource cleanup, and isolation between concurrent runs to prevent file conflicts and process leaks.

**Changes Implemented**:

1. **Per-Run Isolation**:
   - Each capture run now has a unique `runId` (using nanoid)
   - Screenshots stored in isolated directories: `screenshots/{runId}/`
   - ZIP files created within run-specific directories
   - Prevents file conflicts between concurrent capture operations

2. **Process Management and Cancellation**:
   - `ScreenshotService` tracks all active child processes in a `Set<ChildProcess>`
   - `abort()` method properly terminates processes (SIGTERM, then SIGKILL after 5s)
   - Abort status checked between batches and before each operation
   - Frontend uses `AbortController` with SSE fetch to cancel HTTP requests

3. **Resource Cleanup**:
   - Backend uses `finally` block to guarantee cleanup in all scenarios (success/error/abort)
   - Deletes ZIP files after upload or on error
   - Removes entire run directory including all screenshots
   - Event listeners for client disconnection trigger cleanup

4. **Frontend Improvements**:
   - Cancel button calls `onError()` with "USER_CANCELLED" code to exit progress screen
   - Buffered line parsing for SSE with proper end-of-stream handling
   - "Lancer les captures" button disabled when article count is 0
   - AbortError handled gracefully without showing error messages

**Technical Details**:
- Concurrency: 3 parallel screenshot captures per batch
- Process termination: SIGTERM with 5-second SIGKILL fallback
- Path isolation: `{runId}` prevents cross-run interference
- Cleanup guaranteed via try-catch-finally pattern

# Production Recommendations

The application is currently designed for internal/controlled environments. For public production deployment, consider these enhancements:

## Security (Critical)
- **Authentication**: Add user authentication (Replit Auth, JWT, or OAuth) to protect endpoints
- **Rate Limiting**: Implement per-IP and per-user rate limits (express-rate-limit) to prevent abuse
- **CSRF Protection**: Add CSRF tokens for state-changing operations
- **Input Sanitization**: Validate and sanitize department codes to prevent path traversal
- **Authorization**: Role-based access control if multi-tenant

## Robustness
- **Per-Article Timeouts**: Add timeout per shot-scraper process (e.g., 30s per URL)
- **Retry Logic**: Implement exponential backoff for failed screenshots (2-3 retries)
- **SFTP Retry**: Add retry logic for network failures during uploads
- **Concurrent Jobs Limit**: Global limit on simultaneous capture operations
- **Disk Space Checks**: Verify available disk space before starting captures
- **ZIP Size Limits**: Enforce maximum archive size to prevent resource exhaustion

## Observability
- **Structured Logging**: Add JSON logging with runId, userId, department, timestamps
- **Metrics**: Track success/failure rates, duration, articles per run
- **Health Checks**: Endpoint for monitoring system status and dependencies
- **Error Tracking**: Integration with Sentry or similar service

## Operational
- **Job Persistence**: Store job status in database for reconnection/resume capability
- **Webhook Notifications**: Alert users when long-running captures complete
- **Cleanup Scheduler**: Periodic cleanup of old screenshot directories
- **Dependency Validation**: Startup checks for shot-scraper and Playwright availability
- **Environment Documentation**: Clear setup instructions for shot-scraper installation

## Known Limitations
- Shot-scraper requires Playwright system libraries not available in all Replit environments
- No reconnection/resume support if client disconnects during capture
- Single screenshot failure aborts entire batch (by design)