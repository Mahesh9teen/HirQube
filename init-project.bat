@echo off
REM HirQube Project Initialization Script for Windows
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo 🚀 Initializing HirQube Project...
echo ============================================================
echo.

REM Initialize Git
git init > nul 2>&1
git config user.name "Your Name" > nul 2>&1
git config user.email "your@email.com" > nul 2>&1
echo ✅ Git initialized

REM Create .gitignore
(
echo node_modules/
echo .env
echo .DS_Store
echo *.log
echo dist/
echo build/
echo .idea/
echo .vscode/
) > .gitignore

REM Create Backend structure
echo.
echo Creating backend structure...
if not exist backend mkdir backend
if not exist backend\src mkdir backend\src
if not exist backend\src\controllers mkdir backend\src\controllers
if not exist backend\src\models mkdir backend\src\models
if not exist backend\src\services mkdir backend\src\services
if not exist backend\src\routes mkdir backend\src\routes
if not exist backend\src\middleware mkdir backend\src\middleware
if not exist backend\src\scheduler mkdir backend\src\scheduler

REM Create backend package.json
(
echo {
echo   "name": "hirqube-backend",
echo   "version": "1.0.0",
echo   "description": "HirQube Job Aggregation Backend",
echo   "main": "src/server.js",
echo   "scripts": {
echo     "start": "node src/server.js",
echo     "dev": "nodemon src/server.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "mongoose": "^7.0.0",
echo     "dotenv": "^16.0.3",
echo     "cors": "^2.8.5",
echo     "axios": "^1.3.0",
echo     "node-cron": "^3.0.0"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^2.0.20"
echo   }
echo }
) > backend\package.json

REM Create backend .env
(
echo PORT=5000
echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirqube?retryWrites=true^&w=majority
echo ADZUNA_API_ID=your_app_id
echo ADZUNA_API_KEY=your_api_key
echo LOGODEV_API_KEY=your_logo_dev_key
echo NODE_ENV=development
) > backend\.env

echo ✅ Backend structure created

REM Create Frontend
echo.
echo Creating frontend structure ^(this may take a minute^)...
call npx create-react-app frontend > nul 2>&1
echo ✅ Frontend structure created

REM Create n8n workflows directory
if not exist n8n-workflows mkdir n8n-workflows
echo ✅ n8n workflows directory created

echo.
echo ============================================================
echo ✨ HirQube Project Initialized!
echo ============================================================
echo.
echo 📁 Project structure created
echo.
echo 📝 Next Steps:
echo  1. Update backend\.env with your API keys:
echo     - Adzuna API ID ^& Key
echo     - Logo.dev API Key  
echo     - MongoDB Atlas connection string
echo.
echo  2. Install backend dependencies:
echo     cd backend ^&^& npm install
echo.
echo  3. Run backend:
echo     npm run dev
echo.
echo  4. In another terminal, run frontend:
echo     cd frontend ^&^& npm start
echo.
echo 📚 See IMPLEMENTATION_GUIDE.md for detailed setup
echo ============================================================
echo.

REM Open the guide in default browser
start IMPLEMENTATION_GUIDE.md

endlocal
