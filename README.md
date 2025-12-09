# VoyageHub - Travel Journal (Full-Stack)

A complete travel journal application with separate frontend and backend deployment.

## Architecture
- **Frontend**: Static HTML/CSS/JS on Netlify
- **Backend**: Node.js/Express/MongoDB on Render
- **Database**: MongoDB Atlas

## Deployment Steps

### 1. Deploy Backend (Render)
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: voyagehub-api
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure random string
   - `NODE_ENV`: `production`
7. Deploy

### 2. Deploy Frontend (Netlify)
1. Update `netlify.toml` with your backend URL:
   ```toml
   [[redirects]]
   from = "/api/*"
   to = "https://your-backend-url.onrender.com/api/:splat"
   status = 200
   ```
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `public` folder
4. Or connect GitHub repository for auto-deploys

### 3. Update Frontend Configuration
Edit `public/config.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

## Local Development

### Backend
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

### Frontend
```bash
# Serve the public folder
cd public
python -m http.server 8000
# Or use any static server
```

## Features
- User registration and login
- JWT authentication
- Create/edit/delete journal entries
- MongoDB data persistence
- Responsive design
- Modern UI with Tailwind CSS

## API Endpoints
- `POST /api/register` - Register user
- `POST /api/login` - Login user
- `GET /api/journals` - Get user journals (protected)
- `POST /api/journals` - Create journal (protected)
- `PUT /api/journals/:id` - Update journal (protected)
- `DELETE /api/journals/:id` - Delete journal (protected)

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: Server port (default: 5000)

## Database Setup
1. Create MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Add to environment variables

## Troubleshooting
- **CORS Issues**: Ensure backend allows frontend origin
- **Auth Issues**: Check JWT_SECRET is same on both deployments
- **DB Connection**: Verify MongoDB URI and network access
