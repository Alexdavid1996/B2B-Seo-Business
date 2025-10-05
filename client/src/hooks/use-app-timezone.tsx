import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get the current app timezone setting
 * This ensures all timestamps throughout the system use the same timezone
 */
export const useAppTimezone = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/public"],
    refetchInterval: 30000, // Reduce polling frequency for VPS stability  
    staleTime: 25000, // Cache settings for 25 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });

  const appTimezone = (settings as any)?.appTimezone || (settings as any)?.adminTimezone || "UTC";

  return {
    appTimezone,
    isLoading,
  };
};

/**
 * Format timestamp using a specific timezone
 */
export const formatTimestampWithTimezone = (
  timestamp: string | Date | null,
  timezone: string,
  options?: {
    showDate?: boolean;
    showTime?: boolean;
    showSeconds?: boolean;
  }
) => {
  
  if (!timestamp) return "—";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return "Invalid Date";

  const { showDate = true, showTime = true, showSeconds = false } = options || {};

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      ...(showDate && {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      ...(showTime && {
        hour: "2-digit",
        minute: "2-digit",
        ...(showSeconds && { second: "2-digit" }),
      }),
    });

    return formatter.format(date);
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return date.toLocaleString();
  }
};

/**
 * Convert a date to a specific timezone for database operations
 */
export const convertToTimezone = (date: Date | string, timezone: string) => {
  
  const targetDate = typeof date === "string" ? new Date(date) : date;
  
  try {
    // Convert to specified timezone for consistent database operations
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    const parts = formatter.formatToParts(targetDate);
    
    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    const hour = parts.find(p => p.type === "hour")?.value;
    const minute = parts.find(p => p.type === "minute")?.value;
    const second = parts.find(p => p.type === "second")?.value;
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  } catch (error) {
    console.error("Error converting to timezone:", error);
    return targetDate.toISOString();
  }
};

/**
 * Hook-based wrapper for formatting timestamps with app timezone
 */
export const useFormatTimestamp = () => {
  const { appTimezone } = useAppTimezone();
  
  return (timestamp: string | Date | null, options?: {
    showDate?: boolean;
    showTime?: boolean;
    showSeconds?: boolean;
  }) => formatTimestampWithTimezone(timestamp, appTimezone, options);
};

/**
 * Hook-based wrapper for converting dates to app timezone
 */
export const useConvertToAppTimezone = () => {
  const { appTimezone } = useAppTimezone();
  
  return (date: Date | string) => convertToTimezone(date, appTimezone);
};