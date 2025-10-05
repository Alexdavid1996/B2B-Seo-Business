import { useState, useEffect, createContext, useContext } from "react";
import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Timezone Context
interface TimezoneContextType {
  adminTimezone: string;
  isLoading: boolean;
}

const TimezoneContext = createContext<TimezoneContextType>({
  adminTimezone: "UTC",
  isLoading: false
});

export const TimezoneProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/public"], // Use public settings for universal access
    refetchInterval: 30000, // Refetch every 30 seconds - less aggressive for VPS
    staleTime: 25000, // Keep data fresh for 25 seconds
    gcTime: 60000, // Cache for 1 minute
  });

  // Check both adminTimezone and appTimezone for backwards compatibility
  const adminTimezone = settings?.adminTimezone || settings?.appTimezone || "UTC";

  return (
    <TimezoneContext.Provider value={{ adminTimezone, isLoading }}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => useContext(TimezoneContext);

interface LiveClockProps {
  timezone?: string;
  format?: "12" | "24";
  showIcon?: boolean;
  className?: string;
  label?: string;
  showDate?: boolean;
  useAdminTimezone?: boolean;
}

export default function LiveClock({ 
  timezone = "UTC", 
  format = "24", 
  showIcon = true, 
  className = "",
  label,
  showDate = true,
  useAdminTimezone = false
}: LiveClockProps) {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const { adminTimezone } = useTimezone();
  
  const effectiveTimezone = useAdminTimezone ? adminTimezone : timezone;
  const effectiveLabel = label || (useAdminTimezone ? adminTimezone : timezone);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let dateTimeString = "";

      if (effectiveTimezone === "UTC") {
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = now.toISOString().slice(11, 19); // HH:MM:SS
        dateTimeString = showDate ? `${dateStr} ${timeStr}` : timeStr;
      } else {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: effectiveTimezone,
          year: showDate ? "numeric" : undefined,
          month: showDate ? "2-digit" : undefined,
          day: showDate ? "2-digit" : undefined,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: format === "12"
        };
        dateTimeString = now.toLocaleString("en-US", options);
      }

      setCurrentDateTime(dateTimeString);
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [effectiveTimezone, format, showDate]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <Clock className="h-4 w-4 text-gray-500" />}
      <span className="text-sm font-mono">
        {effectiveLabel}: {currentDateTime}
      </span>
    </div>
  );
}

// Hook for getting formatted UTC timestamp
export const useUTCTimestamp = () => {
  return () => new Date().toISOString();
};

// Enhanced utility function to format timestamp with timezone
export const formatTimestamp = (timestamp: string, timezone = "UTC", format: "12" | "24" = "24", showDate = true) => {
  const date = new Date(timestamp);
  
  if (timezone === "UTC") {
    const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = date.toISOString().slice(11, 19); // HH:MM:SS
    return showDate ? `${dateStr} ${timeStr} UTC` : `${timeStr} UTC`;
  }
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: showDate ? "numeric" : undefined,
    month: showDate ? "2-digit" : undefined,
    day: showDate ? "2-digit" : undefined,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: format === "12"
  };
  
  return date.toLocaleString("en-US", options);
};

// Get current UTC timestamp for backend storage
export const getCurrentUTCTimestamp = () => {
  return new Date().toISOString();
};

// Hook to format timestamps dynamically with admin timezone
export const useTimestampFormatter = () => {
  const { adminTimezone } = useTimezone();
  
  return (timestamp: string, showDate = true, format: "12" | "24" = "24") => {
    return formatTimestamp(timestamp, adminTimezone, format, showDate);
  };
};