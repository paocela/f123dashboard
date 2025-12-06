# Quick Build & Deploy Reference

## Development
```bash
npm run dev                    # Start dev servers (client + server + shared watch)
npm run start:client           # Start Angular dev server only
npm run start:server           # Start Express dev server only
```

## Building for Production
```bash
npm run build                  # Build everything to dist/ folder
npm run clean                  # Clean dist/ folder
npm run build:all              # Build all packages without copying
npm run start:prod             # Test production build locally
```

## What `npm run build` Does
1. **Clean**: Removes old `dist/` folder
2. **Build Shared**: Compiles TypeScript types (`shared/dist`)
3. **Build Server**: Compiles Express backend (`server/dist`)
4. **Build Client**: Compiles Angular app (`client/dist/browser`)
5. **Copy All**: Copies everything to `dist/` with production structure

## Production Directory Structure
```
dist/
├── package.json              # Production package.json (auto-generated)
├── .env.example              # Environment template
├── README.md                 # Deployment instructions
├── node_modules/             # Dependencies from server/
├── shared/                   # Compiled types
├── server/                   # Compiled backend
│   └── server.js            # Entry point
└── client/browser/           # Angular build (served by Express)
```

## Deploy to Production

### Quick Deploy
```bash
# 1. Build
npm run build

# 2. Transfer
scp -r dist/ user@server:/var/www/f123dashboard/

# 3. Setup on server
ssh user@server
cd /var/www/f123dashboard
cp .env.example .env
nano .env  # Add production values

# 4. Start
pm2 start server/server.js --name f123dashboard
pm2 save
```

### Update Existing Deployment
```bash
# Build and transfer
npm run build
scp -r dist/ user@server:/var/www/f123dashboard/

# Restart
ssh user@server "pm2 restart f123dashboard"
```

## Environment Variables
Required in `dist/.env`:
```env
RACEFORFEDERICA_DB_DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-chars
MAIL_USER=email@example.com
MAIL_PASS=password
RACEFORFEDERICA_DREANDOS_SECRET=twitch-secret
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

## Verify Deployment
```bash
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"...","environment":"production"}
```

## Common Issues

**Server can't find client files**
- Ensure `NODE_ENV=production` is set
- Check: `ls -la dist/client/browser/index.html`

**Database connection failed**
- Verify: `psql $RACEFORFEDERICA_DB_DATABASE_URL`

**Port already in use**
- Change `PORT` in `.env` or stop other process

## See Also
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [server/docs/](server/docs/) - API documentation
- [.github/instructions/](\.github/instructions/) - Architecture docs
