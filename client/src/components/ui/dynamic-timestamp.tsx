import { useFormatTimestamp } from "@/hooks/use-app-timezone";

interface DynamicTimestampProps {
  timestamp: string;
  showDate?: boolean;
  showTime?: boolean;
  showSeconds?: boolean;
  className?: string;
}

export default function DynamicTimestamp({ 
  timestamp, 
  showDate = true, 
  showTime = true,
  showSeconds = false,
  className = ""
}: DynamicTimestampProps) {
  const formatTimestamp = useFormatTimestamp();
  
  const formattedTime = formatTimestamp(timestamp, {
    showDate,
    showTime,
    showSeconds
  });
  
  return (
    <span className={`font-mono text-sm ${className}`}>
      {formattedTime}
    </span>
  );
}