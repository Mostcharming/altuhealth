module.exports = {
  apps: [
    {
      name: "backend",
      script: "npm",
      args: "start",
      cwd: "./backend",
      env: {
        NODE_ENV: "production",
        PORT: 3006
      }
    },
    {
      name: "landing",
      script: "npm",
      args: "start",
      cwd: "./frontend/landing",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "admin",
      script: "npm",
      args: "start",
      cwd: "./frontend/admin",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    },
    {
      name: "provider",
      script: "npm",
      args: "start",
      cwd: "./frontend/provider",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      }
    },
    {
      name: "enrollee",
      script: "npm",
      args: "start",
      cwd: "./frontend/enrollee",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      }
    },
    {
      name: "doctors",
      script: "npm",
      args: "start",
      cwd: "./frontend/doctors",
      env: {
        NODE_ENV: "production",
        PORT: 3004
      }
    },
    {
      name: "retail",
      script: "npm",
      args: "start",
      cwd: "./frontend/retail",
      env: {
        NODE_ENV: "production",
        PORT: 3005
      }
    }
  ]
};
