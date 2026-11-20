// Production builds expect the Django API to be served from the same origin
// (e.g. behind a reverse proxy at /api). Change to an absolute URL if the API
// lives on a separate domain, and add that origin to CORS_ALLOWED_ORIGINS.
export const environment = {
  production: true,
  apiUrl: '/api',
};
