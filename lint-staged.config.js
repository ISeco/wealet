module.exports = {
  'apps/api/**/*.ts': () => [
    'pnpm --filter api lint',
    'pnpm --filter api type-check',
  ],
  'apps/web/**/*.{ts,tsx}': () => [
    'pnpm --filter web lint',
    'pnpm --filter web type-check',
  ],
};
