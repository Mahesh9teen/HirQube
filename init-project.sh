#!/bin/bash

# HirQube Project Initialization Script
echo "🚀 Initializing HirQube Project..."

# Initialize Git
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.DS_Store
*.log
dist/
build/
.idea/
.vscode/
EOF

echo "✅ Git initialized"

# Create Backend structure
mkdir -p backend/src/{controllers,models,services,routes,middleware,scheduler}
cd backend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "hirqube-backend",
  "version": "1.0.0",
  "description": "HirQube Job Aggregation Backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "axios": "^1.3.0",
    "node-cron": "^3.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
EOF

# Create .env
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirqube?retryWrites=true&w=majority
ADZUNA_API_ID=your_app_id
ADZUNA_API_KEY=your_api_key
LOGODEV_API_KEY=your_logo_dev_key
NODE_ENV=development
EOF

echo "✅ Backend structure created"
echo "⚠️  Update backend/.env with your API keys"

# Navigate back and create Frontend
cd ..
npx create-react-app frontend --template typescript 2>/dev/null || npx create-react-app frontend

echo "✅ Frontend structure created (React with TypeScript)"

# Create n8n workflows directory
mkdir -p n8n-workflows

echo "✅ n8n workflows directory created"

echo ""
echo "════════════════════════════════════════"
echo "✨ HirQube Project Initialized!"
echo "════════════════════════════════════════"
echo ""
echo "📁 Project structure created"
echo "📝 Next steps:"
echo "  1. Update backend/.env with your API keys:"
echo "     - Adzuna API ID & Key"
echo "     - Logo.dev API Key"
echo "     - MongoDB Atlas connection string"
echo ""
echo "  2. Run backend:"
echo "     cd backend && npm install && npm run dev"
echo ""
echo "  3. Run frontend (in another terminal):"
echo "     cd frontend && npm install && npm start"
echo ""
echo "📚 See IMPLEMENTATION_GUIDE.md for detailed steps"
echo ""
