const { execSync } = require('child_process');

const env = { ...process.env, DB_DATABASE: 'wealet_test' };

execSync('pnpm typeorm migration:run', { stdio: 'inherit', env });
