module.exports = {
  apps: [
    {
      name: "backend",
      script: "server.js",
      cwd: "./backend/src",
      env: {
        NODE_ENV: "production",
        PORT: 3006
      }
    },
    {
      name: "frontend-admin",
      script: "npm",
      args: "start",
      cwd: "./frontend/admin",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
  ]
};
