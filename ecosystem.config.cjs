// PM2 process file: how to run our apps in production
// Start:  pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'clinic-api',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 1, // WebSockets: keep 1 instance (see note below)
      max_memory_restart: '300M', // restart if memory goes above 300 MB
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'clinic-web',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};