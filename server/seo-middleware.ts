// SEO Middleware for server-side meta tag injection
// This middleware intercepts HTML responses and injects dynamic SEO tags

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { detectPageFromUrl, generateMetaTags, injectMetaIntoHTML } from "./seo-server.js";
import { injectRuntimeConfig } from "./vite";

function createSEOMiddleware() {
  let htmlTemplate: string | null = null;

  // Cache the HTML template
  function getHTMLTemplate() {
    if (!htmlTemplate) {
      // Get the directory where this middleware file is located (/server)
      const currentFile = fileURLToPath(import.meta.url);
      const serverDir = path.dirname(currentFile);
      const appRoot = path.resolve(serverDir, "..");

      const htmlPath =
        process.env.NODE_ENV === "production"
          ? path.join(appRoot, "dist/public/index.html")
          : path.join(appRoot, "client/index.html");

      if (fs.existsSync(htmlPath)) {
        const rawTemplate = fs.readFileSync(htmlPath, "utf-8");
        htmlTemplate = injectRuntimeConfig(rawTemplate);
        console.log(`[SEO] HTML template loaded: ${htmlPath}`);
      } else {
        console.error(`[SEO] ERROR: HTML template not found at: ${htmlPath}`);
        console.log(
          `[SEO] App root: ${appRoot}, files:`,
          fs.readdirSync(appRoot).join(", "),
        );
      }
    }
    return htmlTemplate;
  }

  return async (req, res, next) => {
    const url = req.originalUrl;

    // Skip SEO processing for specific routes
    const skipSEORoutes = [
      "/api/",
      "/@",
      "/verify-email",
      "verify-email",
      "token=",
      "&error=",
      "/auth/reset-password",
      "/auth/forgot-password",
    ];

    // Only handle GET requests for HTML pages (not API routes, assets, or verification pages)
    if (
      req.method !== "GET" ||
      url.includes(".") ||
      skipSEORoutes.some((route) => url.includes(route))
    ) {
      return next();
    }

    // For production: intercept static HTML serving
    if (process.env.NODE_ENV === "production") {
      const template = getHTMLTemplate();
      if (!template) {
        return next();
      }

      // Detect the page type from URL
      const pageKey = detectPageFromUrl(url);

      // Generate SEO meta tags for this page
      const metaTags = generateMetaTags(pageKey);

      // Inject SEO tags into HTML
      const htmlWithSEO = injectMetaIntoHTML(template, metaTags);

      console.log(
        `[SEO] Serving dynamic HTML with SEO for: ${url}`,
        typeof pageKey === "object" ? JSON.stringify(pageKey) : pageKey,
      );

      // Send the modified HTML
      res.setHeader("Content-Type", "text/html");
      res.send(htmlWithSEO);
      return;
    } else {
      // For development: store SEO data for Vite middleware
      const pageKey = detectPageFromUrl(url);
      const metaTags = generateMetaTags(pageKey);

      res.locals.seoTags = metaTags;
      res.locals.pageKey = pageKey;

      // console.log(`[SEO] Generated server-side meta tags for: ${url} (${pageKey})`);
    }
    
    // Continue to next middleware
    next();
  };
}

export { createSEOMiddleware };
