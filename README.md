# Hour Tracker

A full-stack time tracking application built with Ruby on Rails (backend) and Angular (frontend). The backend generates OpenAPI specifications using rswag, which are automatically consumed by the Angular frontend to create type-safe API clients.

## Architecture Overview

- **Backend**: Ruby on Rails API with OpenAPI spec generation
- **Frontend**: Angular 20 with TypeScript and Bootstrap
- **API Documentation**: Auto-generated OpenAPI 3.0 specs using rswag
- **Type Safety**: Auto-generated TypeScript clients from OpenAPI specs

## Prerequisites

- Ruby 3.2.2+
- Node.js 18+
- npm or yarn
- SQLite3 (for development)

## Project Structure

```
hour-tracker/
├── backend/          # Rails API application
├── frontend/         # Angular application
└── README.md         # This file
```

## Quick Start

### 1. Backend Setup (Rails API)

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

### 2. Frontend Setup (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start the Angular development server
ng serve
```

The frontend will be available at `http://localhost:4200`

## Development Workflow

### Backend Development

#### Adding New API Endpoints

1. **Create/Update Controllers**: Add your controller actions in `app/controllers/`

2. **Create rswag Specs**: Create request specs in `spec/requests/` that document your API:

```ruby
# spec/requests/users_spec.rb
require 'swagger_helper'

RSpec.describe 'users', type: :request do
  path '/users' do
    get('list users') do
      tags 'Users'
      description 'Retrieve all users'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer },
              first_name: { type: :string },
              last_name: { type: :string },
              username: { type: :string },
              email: { type: :string }
            }
          }

        run_test!
      end
    end
  end
end
```

3. **Generate OpenAPI Specs**: Run the rswag rake task to generate/update the OpenAPI specification:

```bash
bundle exec rake rswag:specs:swaggerize
```

This creates/updates `swagger/v1/swagger.yaml`

4. **Test Your API**: Run the specs to ensure your API works correctly:

```bash
bundle exec rspec spec/requests/
```

### Frontend Development

#### Updating API Client from Backend Changes

When the backend API changes, follow these steps to update the frontend:

1. **Regenerate OpenAPI Specs** (in backend directory):
```bash
cd backend
bundle exec rake rswag:specs:swaggerize
```

2. **Generate TypeScript Client** (in frontend directory):
```bash
cd frontend
npx @openapitools/openapi-generator-cli generate \
  -i ../backend/swagger/v1/swagger.yaml \
  -g typescript-angular \
  -o ./src/generated-api \
  --additional-properties=ngVersion=20,npmName=hour-tracker-api,supportsES6=true,withInterfaces=true
```

3. **Use Generated Types and Services** in your Angular components:

```typescript
import { UsersService } from '../generated-api/api/users.service';
import { UsersGet200ResponseInner } from '../generated-api';

@Component({...})
export class UsersComponent {
  constructor(private usersService: UsersService) {}

  loadUsers() {
    this.usersService.usersGet().subscribe(users => {
      // users is fully typed based on your OpenAPI spec
      console.log(users);
    });
  }
}
```

#### Adding New Components

```bash
cd frontend
ng generate component my-new-component
```

## API Documentation

### Generated API Endpoints

After running `rake rswag:specs:swaggerize`, you can view the complete API documentation at:

- **OpenAPI Spec**: `backend/swagger/v1/swagger.yaml`
- **Swagger UI**: Available when backend is running (if configured)

### Example API Usage

**List Users:**
```bash
curl http://localhost:3000/users
```

**Create User:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }'
```

## Configuration

### Backend Configuration

- **Database**: SQLite3 (development), configured in `config/database.yml`
- **CORS**: Configured in `config/initializers/cors.rb` for frontend access
- **OpenAPI**: Configured in `spec/swagger_helper.rb`

### Frontend Configuration

- **API Base URL**: Configured in `src/app/app.config.ts` (defaults to `http://localhost:3000`)
- **Bootstrap**: Configured in `angular.json` styles array
- **Generated API**: Located in `src/generated-api/`

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
bundle exec rspec

# Run specific test file
bundle exec rspec spec/requests/users_spec.rb

# Run tests and generate OpenAPI specs
bundle exec rake rswag:specs:swaggerize
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
ng test

# Run e2e tests
ng e2e

# Build for production
ng build
```

## Common Tasks

### Adding a New Model with API

1. **Generate the model and migration**:
```bash
cd backend
rails generate model MyModel name:string description:text
rails db:migrate
```

2. **Create the controller**:
```bash
rails generate controller MyModels index show create update destroy
```

3. **Add routes** in `config/routes.rb`:
```ruby
resources :my_models
```

4. **Create rswag specs** in `spec/requests/my_models_spec.rb`

5. **Generate OpenAPI specs**:
```bash
bundle exec rake rswag:specs:swaggerize
```

6. **Update frontend API client**:
```bash
cd ../frontend
npx @openapitools/openapi-generator-cli generate \
  -i ../backend/swagger/v1/swagger.yaml \
  -g typescript-angular \
  -o ./src/generated-api \
  --additional-properties=ngVersion=20,npmName=hour-tracker-api,supportsES6=true,withInterfaces=true
```

7. **Create Angular component** to use the new API:
```bash
ng generate component my-models
```

### Updating API Schemas

When you modify your Rails models or controller responses:

1. Update the rswag specs with the new schema
2. Regenerate the OpenAPI specs: `bundle exec rake rswag:specs:swaggerize`
3. Regenerate the frontend client (see command above)
4. Update your Angular components to use the new types

## Automation Scripts

You can create scripts to automate the API generation process:

**Backend script** (`backend/bin/generate-api-docs`):
```bash
#!/bin/bash
bundle exec rake rswag:specs:swaggerize
echo "OpenAPI specs generated at swagger/v1/swagger.yaml"
```

**Frontend script** (`frontend/scripts/update-api-client.sh`):
```bash
#!/bin/bash
npx @openapitools/openapi-generator-cli generate \
  -i ../backend/swagger/v1/swagger.yaml \
  -g typescript-angular \
  -o ./src/generated-api \
  --additional-properties=ngVersion=20,npmName=hour-tracker-api,supportsES6=true,withInterfaces=true

echo "TypeScript API client updated in src/generated-api/"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is properly configured in `backend/config/initializers/cors.rb`

2. **API Client Generation Fails**:
   - Check that the OpenAPI spec is valid YAML
   - Ensure the OpenAPI generator CLI is properly installed

3. **Type Errors in Frontend**:
   - Regenerate the API client after backend changes
   - Check that the OpenAPI spec matches your actual API responses

4. **Backend Test Failures**:
   - Ensure database is migrated: `rails db:migrate RAILS_ENV=test`
   - Check that test data is properly set up

### Getting Help

- Check the Rails logs: `tail -f backend/log/development.log`
- Check the Angular console for frontend errors
- Validate your OpenAPI spec at [Swagger Editor](https://editor.swagger.io/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Update/add rswag specs for API changes
4. Regenerate OpenAPI specs
5. Update frontend API client if needed
6. Run tests
7. Submit a pull request

## License

[Add your license information here]
