# AI Assistant Instructions for Hour Tracker Project

## Project Overview

This is a full-stack time tracking application with:
- **Backend**: Ruby on Rails 8.0 API (port 3000)
- **Frontend**: Angular 20 with TypeScript and Bootstrap (port 4200)
- **Database**: SQLite3 (development)
- **API Documentation**: Auto-generated OpenAPI 3.0 specs using rswag
- **Type Safety**: Auto-generated TypeScript clients from OpenAPI specs

## Architecture & Key Concepts

### Backend (Rails API)
- API-only Rails application
- Uses rswag for OpenAPI spec generation from request specs
- CORS enabled for frontend communication
- SQLite3 database with Active Record models
- Rich text support via Action Text
- Background jobs via Solid Queue

### Frontend (Angular)
- Angular 20 with TypeScript and SCSS
- Bootstrap 5 for styling
- Auto-generated API clients from OpenAPI specs
- Two generated API client locations:
  - `src/generated-api/` (main API client)
  - `src/app/generated-api/` (alternative location)

### Data Model Structure

#### Core Entities:
1. **User** - System users
   - Fields: first_name, last_name, username, email
   - Associations: has_many user_positions, positions (through user_positions), time_entries

2. **Company** - Organizations that offer positions
   - Fields: name, description
   - Associations: has_many positions, users (through positions)

3. **Position** - Job positions within companies
   - Fields: title, description, remote (boolean)
   - Associations: belongs_to company, has_many user_positions, users (through user_positions)

4. **UserPosition** - Junction table linking users to positions
   - Fields: start_date, end_date
   - Associations: belongs_to user, belongs_to position, has_many time_entries, has_many hourly_rates

5. **TimeEntry** - Individual time tracking records
   - Fields: minutes_worked, date, description, notes (rich text)
   - Associations: belongs_to user_position, belongs_to user, belongs_to group (optional)
   - Validations: minutes_worked > 0 and <= 1440, unique user per position per date

6. **Group** - User-defined categories for organizing time entries
   - Fields: name, description, color
   - Associations: belongs_to user, has_many time_entries

7. **HourlyRate** - Historical rate tracking for user positions
   - Fields: rate_cents, effective_date
   - Associations: belongs_to user_position

## Development Workflow

### Adding New API Endpoints
1. Create/update controllers in `backend/app/controllers/`
2. Create rswag specs in `backend/spec/requests/` with proper OpenAPI annotations
3. Run `bundle exec rake rswag:specs:swaggerize` to generate OpenAPI specs
4. Run `bundle exec rspec spec/requests/` to test APIs

### Updating Frontend After Backend Changes
1. Regenerate OpenAPI specs: `cd backend && bundle exec rake rswag:specs:swaggerize`
2. Generate TypeScript client:
   ```bash
   cd frontend
   npx @openapitools/openapi-generator-cli generate \
     -i ../backend/swagger/v1/swagger.yaml \
     -g typescript-angular \
     -o ./src/generated-api \
     --additional-properties=ngVersion=20,npmName=hour-tracker-api,supportsES6=true,withInterfaces=true
   ```

### Adding New Models
1. Generate model and migration: `rails generate model ModelName field:type`
2. Run migration: `rails db:migrate`
3. Create controller: `rails generate controller ModelNames index show create update destroy`
4. Add routes in `config/routes.rb`
5. Create rswag specs for the new endpoints
6. Generate OpenAPI specs and update frontend client

## Key Files & Locations

### Backend Important Files:
- Models: `backend/app/models/`
- Controllers: `backend/app/controllers/`
- Routes: `backend/config/routes.rb`
- Database schema: `backend/db/schema.rb`
- Seeds: `backend/db/seeds.rb` (comprehensive test data)
- OpenAPI specs: `backend/swagger/v1/swagger.yaml`
- Request specs: `backend/spec/requests/`
- CORS config: `backend/config/initializers/cors.rb`

### Frontend Important Files:
- Generated API client: `frontend/src/generated-api/`
- App config: `frontend/src/app/app.config.ts`
- Environments: `frontend/src/environments/`
- Angular config: `frontend/angular.json`
- OpenAPI generator config: `frontend/openapitools.json`

## Testing

### Backend Testing:
- Use rspec for testing: `bundle exec rspec`
- Request specs also generate OpenAPI documentation
- Database uses transactional fixtures
- Comprehensive seed data available for development

### Frontend Testing:
- Unit tests: `ng test`
- E2E tests: `ng e2e`
- Build: `ng build`

## Common Commands

### Backend:
- Start server: `rails server`
- Run tests: `bundle exec rspec`
- Generate API docs: `bundle exec rake rswag:specs:swaggerize`
- Setup database: `rails db:prepare`
- Seed database: `rails db:seed`

### Frontend:
- Start dev server: `ng serve`
- Generate component: `ng generate component component-name`
- Update API client: Use the npx command above
- Install dependencies: `npm install`

## API Documentation
- OpenAPI spec location: `backend/swagger/v1/swagger.yaml`
- Swagger UI: Available when backend is running (if configured)
- Base API URL: `http://localhost:3000`

## Authentication Status
- Planning documents indicate OIDC/JWT authentication is planned
- Current implementation appears to be without authentication
- Future plans include role-based access control (RBAC)

## Code Style & Preferences
- Backend uses Rails conventions and standard Ruby style
- Frontend uses Angular conventions with TypeScript
- SCSS for styling with Bootstrap integration
- Database uses Rails migrations and Active Record associations

## Automation Scripts
- Backend: `backend/bin/generate-api-docs` (for API doc generation)
- Frontend: `frontend/scripts/update-api-client.sh` (for client updates)
- Root level: `update-api.sh` (likely for full API update workflow)

## Important Notes
- The project uses comprehensive seeds for development data
- Time entries are validated to prevent duplicates per user/position/date
- Rich text support is available for time entry notes
- Groups provide color-coded organization for time entries
- Historical hourly rates are tracked with effective dates
- Database includes multiple schema files for different Rails components (queue, cache, cable)

## When Making Changes
1. Always read existing code patterns before implementing new features
2. Follow the established rswag pattern for API documentation
3. Update both backend specs and frontend client when changing APIs
4. Use the existing model associations and validation patterns
5. Test changes with the comprehensive seed data
6. Maintain the OpenAPI-first approach for API development

