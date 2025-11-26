import { cpSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('📦 Copying files to dist/...');

// Create dist directory
mkdirSync(join(rootDir, 'dist'), { recursive: true });

// Copy shared
console.log('  → Copying shared types...');
if (existsSync(join(rootDir, 'shared/dist'))) {
  cpSync(
    join(rootDir, 'shared/dist'),
    join(rootDir, 'dist/shared'),
    { recursive: true }
  );
} else {
  console.warn('  ⚠️  shared/dist not found, skipping...');
}

// Copy server
console.log('  → Copying server...');
if (existsSync(join(rootDir, 'server/dist'))) {
  cpSync(
    join(rootDir, 'server/dist'),
    join(rootDir, 'dist/server'),
    { recursive: true }
  );
} else {
  console.warn('  ⚠️  server/dist not found, skipping...');
}

// Copy client
console.log('  → Copying client...');
if (existsSync(join(rootDir, 'client/dist/browser'))) {
  cpSync(
    join(rootDir, 'client/dist/browser'),
    join(rootDir, 'dist/client/browser'),
    { recursive: true }
  );
} else {
  console.warn('  ⚠️  client/dist/browser not found, skipping...');
}

// REMOVED: Copying node_modules is unnecessary and buggy with workspaces.
// Node will resolve dependencies from the root node_modules folder.

// Create production package.json (Optional, mostly for reference now)
console.log('  → Creating production package.json...');
// Create production package.json (Optional, mostly for reference now)
console.log('  → Creating production package.json...');
const prodPackage = {
  name: "f123dashboard-server",
  version: "1.0.0",
  type: "module",
  scripts: {
    start: "node server/server.js"
  },
  dependencies: {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "morgan": "^1.10.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "nodemailer": "^6.9.7",
    "node-cron": "^3.0.3",
    "axios": "^1.8.4"
  }
};

writeFileSync(
  join(rootDir, 'dist/package.json'),
  JSON.stringify(prodPackage, null, 2)
);

// Create .env template
console.log('  → Creating .env template...');
const envTemplate = `# Database
RACEFORFEDERICA_DB_DATABASE_URL=postgresql://user:pass@localhost:5432/f123dashboard

# Authentication
JWT_SECRET=your-production-secret-key-min-32-chars

# Email
MAIL_USER=noreply@yourdomain.com
MAIL_PASS=your-email-password

# Twitch
RACEFORFEDERICA_DREANDOS_SECRET=your-twitch-webhook-secret

# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
`;

writeFileSync(join(rootDir, 'dist/.env.example'), envTemplate);

// Create README for deployment


console.log('\n✅ Build copied to dist/');
console.log('\n📁 Dist structure:');
console.log('dist/');
console.log('├── package.json');
console.log('├── .env.example');
console.log('├── README.md');
console.log('├── node_modules/');
console.log('├── shared/');
console.log('├── server/');
console.log('│   ├── server.js');
console.log('│   ├── controllers/');
console.log('│   ├── services/');
console.log('│   ├── routes/');
console.log('│   ├── middleware/');
console.log('│   └── config/');
console.log('└── client/');
console.log('    └── browser/');
console.log('        └── index.html');
console.log('\n🚀 Ready for deployment!');
console.log('   Run: npm start:prod (for local testing)');
console.log('   Or copy dist/ folder to your production server');
