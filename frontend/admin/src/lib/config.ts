const ENV = process.env.NODE_ENV;

const BASE_URLS = {
  development: "http://localhost:3006/api/v1",
  production: "https://api.myapp.com",
};

export const APP_CONFIG = {
  ENV,
  API_BASE_URL: BASE_URLS[ENV === "production" ? "production" : "development"],
};
