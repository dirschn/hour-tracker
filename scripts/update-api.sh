#!/bin/bash
# Master script to regenerate API specs and update frontend client

set -e  # Exit on any error

echo "🚀 Hour Tracker API Update Workflow"
echo "======================================"

# Step 1: Generate OpenAPI specs from backend
echo "📝 Step 1: Generating OpenAPI specifications..."
cd backend
bundle exec rake rswag:specs:swaggerize

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate OpenAPI specs"
    exit 1
fi

echo "✅ OpenAPI specs generated successfully"

# Step 2: Update frontend API client
echo ""
echo "🔄 Step 2: Updating frontend TypeScript client..."
cd ../frontend

npx @openapitools/openapi-generator-cli generate \
  -i ../backend/swagger/v1/swagger.yaml \
  -g typescript-angular \
  -o ./src/generated-api \
  --additional-properties=ngVersion=20,npmName=hour-tracker-api,supportsES6=true,withInterfaces=true

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate TypeScript client"
    exit 1
fi

echo "✅ Frontend API client updated successfully"

# Summary
echo ""
echo "🎉 API Update Complete!"
echo "========================"
echo "✅ Backend OpenAPI specs: backend/swagger/v1/swagger.yaml"
echo "✅ Frontend API client: frontend/src/generated-api/"
echo ""
echo "💡 Next steps:"
echo "   • Review generated types in frontend/src/generated-api/model/"
echo "   • Update Angular components to use new API methods"
echo "   • Test your changes with: cd frontend && ng serve"
