export const DEFAULT_ADMIN_BASE_PATH = "/Alex1996admin";
export const DEFAULT_EMPLOYEE_BASE_PATH = "/Alex1996employee";

export const ADMIN_ENV_KEYS = [
  "VITE_ADMIN_BASE_PATH",
  "ADMIN_BASE_PATH",
  "REACT_APP_ADMIN_BASE_PATH",
] as const;

export const EMPLOYEE_ENV_KEYS = [
  "VITE_EMPLOYEE_BASE_PATH",
  "EMPLOYEE_BASE_PATH",
  "REACT_APP_EMPLOYEE_BASE_PATH",
] as const;

export const createBasePath = (envValue: unknown, fallback: string) => {
  const trimmedPath = typeof envValue === "string" ? envValue.trim() : "";

  const normalizedPath =
    trimmedPath.length > 0
      ? trimmedPath.startsWith("/")
        ? trimmedPath
        : `/${trimmedPath}`
      : fallback;

  let sanitizedPath = normalizedPath;

  while (sanitizedPath.endsWith("/") && sanitizedPath !== "/") {
    sanitizedPath = sanitizedPath.slice(0, -1);
  }

  return sanitizedPath;
};
