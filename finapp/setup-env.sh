#!/bin/bash

# Setup environment variables for the application
echo "Setting up environment variables..."

# Create .env.local file with API keys
cat > .env.local << EOF
GEMINI_API_KEY=AIzaSyBgEmClWY3WBt1HKSOOoKz-gBhHzw8mfII
MARKETAUX_API_KEY=sgarLBh196hvQlOxfpVLNUEp9r0uuP30yuva8PJT
EOF

echo "Environment variables set up successfully!"
echo "Created .env.local with:"
echo "- GEMINI_API_KEY"
echo "- MARKETAUX_API_KEY"
echo ""
echo "You can now run the application with: npm run dev"
