#!/bin/bash
# Update Angular API client from OpenAPI specification

echo "🔄 Updating TypeScript API client from OpenAPI spec..."

# Check if the OpenAPI spec exists
if [ ! -f "../backend/swagger/v1/swagger.yaml" ]; then
    echo "❌ OpenAPI spec not found at ../backend/swagger/v1/swagger.yaml"
    echo "   Please run 'cd ../backend && bin/generate-api-docs' first"
    exit 1
fi

# Generate the TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i ../backend/swagger/v1/swagger.yaml \
  -g typescript-angular \
  -o ./src/generated-api \
  --additional-properties=ngVersion=20,npmName=hour-tracker-api,supportsES6=true,withInterfaces=true

if [ $? -eq 0 ]; then
    echo "✅ TypeScript API client successfully updated in src/generated-api/"
    echo "📖 You can now use the updated types and services in your Angular components"
else
    echo "❌ Failed to generate TypeScript API client"
    echo "   Check that the OpenAPI spec is valid and try again"
    exit 1
fi
