# Deployment Instructions

## Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set build directory to `frontend`
4. Add environment variables:
   - `REACT_APP_API_URL=https://your-backend-url.com/api`

## Backend Deployment (Render - FREE)

1. Push code to GitHub
2. Go to render.com and connect your GitHub account
3. Create new "Web Service"
4. Select your repository and backend folder
5. Render auto-detects Node.js settings
6. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-secret`
   - `FRONTEND_URL=https://your-app.vercel.app`
7. Deploy!

## Database Setup

1. Create cloud MySQL database
2. Run database migrations
3. Update connection credentials in backend environment

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] Database connections successful
- [ ] CORS configured properly
- [ ] Environment variables set
- [ ] SSL certificates active

## Monitoring

- Set up error tracking (Sentry)
- Monitor API performance
- Database connection monitoring
- User analytics (optional)
