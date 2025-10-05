import {
  ADMIN_ENV_KEYS,
  DEFAULT_ADMIN_BASE_PATH,
  DEFAULT_EMPLOYEE_BASE_PATH,
  EMPLOYEE_ENV_KEYS,
  createBasePath,
} from "@shared/utils/basePath";

type EnvSource = Record<string, string | undefined>;

const RUNTIME_ENV_KEYS = ["__APP_CONFIG__", "__ENV__"] as const;

const collectEnvSources = (): EnvSource[] => {
  const sources: EnvSource[] = [];

  sources.push(import.meta.env as EnvSource);

  if (typeof globalThis !== "undefined") {
    for (const key of RUNTIME_ENV_KEYS) {
      const runtimeEnv = (globalThis as Record<string, unknown>)[key];
      if (runtimeEnv && typeof runtimeEnv === "object") {
        sources.push(runtimeEnv as EnvSource);
      }
    }
  }

  if (typeof process !== "undefined" && process?.env) {
    sources.push(process.env as EnvSource);
  }

  return sources;
};

const resolveEnvValue = (keys: readonly string[]) => {
  const sources = collectEnvSources();

  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  return undefined;
};

export const ADMIN_BASE_PATH = createBasePath(
  resolveEnvValue(ADMIN_ENV_KEYS),
  DEFAULT_ADMIN_BASE_PATH,
);

export const EMPLOYEE_BASE_PATH = createBasePath(
  resolveEnvValue(EMPLOYEE_ENV_KEYS),
  DEFAULT_EMPLOYEE_BASE_PATH,
);
