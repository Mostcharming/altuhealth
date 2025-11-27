const ENV = process.env.NODE_ENV;

const BASE_URLS = {
  development: "http://192.168.1.191:3006/api/v1",
  production: "https://api.altuhealth.com/api/v1",
};

export const APP_CONFIG = {
  ENV,
  API_BASE_URL: BASE_URLS[ENV === "production" ? "production" : "development"],
};
