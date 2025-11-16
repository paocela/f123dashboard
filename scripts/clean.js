import { rmSync } from 'fs';

try {
  rmSync('./dist', { recursive: true, force: true });
  console.log('✅ Cleaned dist/ directory');
} catch (err) {
  console.log('ℹ️  No dist/ directory to clean');
}
