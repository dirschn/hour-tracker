# Hour Tracker

A full-stack time tracking application built with Ruby on Rails (backend) and Angular (frontend). The backend generates OpenAPI specifications using rswag, which are automatically consumed by the Angular frontend to create type-safe API clients.

## Architecture Overview

- **Backend**: Ruby on Rails 8.0 API with OpenAPI spec generation
- **Frontend**: Angular 20 with TypeScript and Bootstrap
- **API Documentation**: Auto-generated OpenAPI 3.0 specs using rswag
- **Type Safety**: Auto-generated TypeScript clients from OpenAPI specs

## Prerequisites

- Ruby 3.2.2+
- Node.js 18+
- npm
- SQLite3 (for development)

## Project Structure

```
hour-tracker/
├── backend/              # Rails API application
├── frontend/             # Angular application
├── scripts/              # Additional utility scripts
└── README.md
```

## Quick Start

### Development Environment (Recommended)

### Manual Setup

#### 1. Backend Setup (Rails API)

```bash
cd backend

# Install dependencies
bundle install

# Setup database
rails db:prepare

# Start the Rails server
rails server
```

The backend will be available at `http://localhost:3000`

#### 2. Frontend Setup (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start the Angular development server
ng serve
```

The frontend will be available at `http://localhost:4200`

## Essential Scripts & Commands

**Start both servers with one command:**
```bash
# From project root
./scripts/dev.sh
```

This launches both Rails and Angular servers using `run-pty`, giving you:
- Interactive dashboard to switch between server outputs (Ctrl+Z)
- Clean shutdown of both servers (Ctrl+C)
- Backend at `http://localhost:3000`
- Frontend at `http://localhost:4200`

### Master API Update Script

The quickest way to update both backend specs and frontend client:

```bash
# From project root
./scripts/update-api.sh
```

This script:
1. Generates OpenAPI specs from rswag tests
2. Updates the Angular TypeScript client
3. Provides clear feedback on success/failure

### Individual Commands

**Backend API Documentation:**
```bash
cd backend
bin/generate-api-docs
# or
bundle exec rails rswag:specs:swaggerize
```

**Frontend API Client Update:**
```bash
cd frontend
npm run update-api-client
# or
npm run api:update
```

**Development Servers:**
```bash
# Backend
cd backend && rails server

# Frontend
cd frontend && ng serve
```

**Testing:**
```bash
# Backend tests
cd backend && bundle exec rspec

# Frontend tests
cd frontend && ng test
```

## Development Workflow

### Making Backend Changes

1. **Modify controllers/models** in `backend/app/`
2. **Update/create rswag specs** in `backend/spec/requests/`
3. **Run the master update script:**
   ```bash
   ./scripts/update-api.sh
   ```
4. **Update Angular components** to use new types/services

### Adding New API Endpoints

1. **Create controller** and add routes in `config/routes.rb`
2. **Create rswag request spec** in `spec/requests/`
3. **Generate documentation:**
   ```bash
   cd backend && bin/generate-api-docs
   ```
4. **Update frontend client:**
   ```bash
   cd frontend && npm run api:update
   ```

## Key Configuration Files

- **Backend CORS**: `backend/config/initializers/cors.rb`
- **Routes**: `backend/config/routes.rb`
- **Database**: `backend/config/database.yml`
- **OpenAPI Config**: `backend/spec/swagger_helper.rb`
- **Frontend Scripts**: `frontend/package.json`

## API Documentation

- **OpenAPI Spec**: `backend/swagger/v1/swagger.yaml` (auto-generated)
- **Swagger UI**: Available at `http://localhost:3000/api-docs` when backend is running
- **Generated TypeScript Types**: `frontend/src/generated-api/`

## Common Issues & Solutions

**CORS Errors**: Check `backend/config/initializers/cors.rb` allows `http://localhost:4200`

**API Client Generation Fails**:
- Ensure OpenAPI spec exists: `ls backend/swagger/v1/swagger.yaml`
- Validate spec at [Swagger Editor](https://editor.swagger.io/)

**Missing Dependencies**:
```bash
# Backend
cd backend && bundle install

# Frontend
cd frontend && npm install
```

## Project Goals

This is a time tracking application for managing:
- User time entries across different positions
- Hourly rates for different roles
- Company and group organization
- Comprehensive time reporting

## Contributing

1. Create a feature branch
2. Make changes and add/update tests
3. Run `./scripts/update-api.sh` if you modified the API
4. Test your changes locally
5. Submit a pull request
