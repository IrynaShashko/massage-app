/**
 * Local twin of the Netlify rule in public/_redirects:
 *   /api/*  ->  backend/:splat
 * Netlify strips the first "/api", so with REACT_APP_API_BASE_URL=/api the app
 * requests "/api/api/reviews" and the backend receives "/api/reviews".
 * Used only by `npm start`; restart the dev server after changing this file.
 */
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://wee-caty-websites-a5c0e3ac.koyeb.app",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
      cookieDomainRewrite: "",
    }),
  );
};
