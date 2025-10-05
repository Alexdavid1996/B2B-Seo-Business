import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import {
  ADMIN_ENV_KEYS,
  DEFAULT_ADMIN_BASE_PATH,
  DEFAULT_EMPLOYEE_BASE_PATH,
  EMPLOYEE_ENV_KEYS,
  createBasePath,
} from "../shared/utils/basePath";

type RuntimeConfig = {
  ADMIN_BASE_PATH: string;
  EMPLOYEE_BASE_PATH: string;
};

const pickEnvValue = (keys: readonly string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const runtimeConfig: RuntimeConfig = {
  ADMIN_BASE_PATH: createBasePath(
    pickEnvValue(ADMIN_ENV_KEYS),
    DEFAULT_ADMIN_BASE_PATH,
  ),
  EMPLOYEE_BASE_PATH: createBasePath(
    pickEnvValue(EMPLOYEE_ENV_KEYS),
    DEFAULT_EMPLOYEE_BASE_PATH,
  ),
};

const serializedRuntimeConfig = JSON.stringify(runtimeConfig).replace(
  /</g,
  "\\u003C",
);

const runtimeConfigScript = [
  "<script>",
  "  (function() {",
  `    const runtime = ${serializedRuntimeConfig};`,
  "    const merge = (target) => Object.assign({}, target, runtime);",
  "    window.__APP_CONFIG__ = merge(window.__APP_CONFIG__);",
  "    window.__ENV__ = merge(window.__ENV__);",
  "  })();",
  "</script>",
].join("\n");

export const injectRuntimeConfig = (html: string) => {
  const scriptTag = `${runtimeConfigScript}\n`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${scriptTag}</head>`);
  }

  if (html.includes("</body>")) {
    return html.replace("</body>", `${scriptTag}</body>`);
  }

  return `${html}${scriptTag}`;
};

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const transformedTemplate = await vite.transformIndexHtml(url, template);
      const page = injectRuntimeConfig(transformedTemplate);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  const indexHtmlPath = path.resolve(distPath, "index.html");
  let cachedIndexHtml: string | undefined;

  // fall through to index.html if the file doesn't exist
  app.use("*", async (_req, res, next) => {
    try {
      if (!cachedIndexHtml) {
        const template = await fs.promises.readFile(indexHtmlPath, "utf-8");
        cachedIndexHtml = injectRuntimeConfig(template);
      }

      res
        .status(200)
        .set({ "Content-Type": "text/html" })
        .send(cachedIndexHtml);
    } catch (error) {
      next(error);
    }
  });
}
