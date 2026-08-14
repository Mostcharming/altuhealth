const ENV = process.env.EXPO_PUBLIC_APP_ENV ?? process.env.NODE_ENV;

const BASE_URLS = {
  development: "http://192.168.1.165:3006/api/v1",
  production: "https://api.altuhealth.com/api/v1",
};

const defaultBaseUrl =
  BASE_URLS[ENV === "production" ? "production" : "development"];

export const APP_CONFIG = {
  ENV,
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultBaseUrl,
};
