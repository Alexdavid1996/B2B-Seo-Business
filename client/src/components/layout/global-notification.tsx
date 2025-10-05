import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppTimezone } from "@/hooks/use-app-timezone";


interface GlobalNotification {
  id: string;
  message: string;
  isActive: boolean;
  notificationType: string;
  durationDays: number | null;
  flashTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function GlobalNotification() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { appTimezone } = useAppTimezone();

  const { data: notifications = [] } = useQuery<GlobalNotification[]>({
    queryKey: ["/api/global-notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter active notifications that haven't expired (using system timezone)
  const activeNotifications = notifications.filter(notification => {
    if (!notification.isActive) return false;
    
    // Check if notification has expired based on duration_days using system timezone
    if (notification.durationDays) {
      // Convert UTC creation time to system timezone
      const createdAt = new Date(notification.createdAt);
      const now = new Date();
      
      // Calculate expiry date by adding duration days to creation date
      const expiryDate = new Date(createdAt.getTime() + (notification.durationDays * 24 * 60 * 60 * 1000));
      
      // Compare in system timezone context
      const nowInSystemTZ = new Date(now.toLocaleString("en-US", { timeZone: appTimezone }));
      const expiryInSystemTZ = new Date(expiryDate.toLocaleString("en-US", { timeZone: appTimezone }));
      
      if (nowInSystemTZ > expiryInSystemTZ) return false;
    }
    
    return true;
  });

  const currentNotification = activeNotifications[currentIndex];

  // Cycle through notifications using individual flash times from database
  useEffect(() => {
    if (activeNotifications.length <= 1) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      // Get flash time for current notification, default to 8 seconds
      const currentFlashTime = (activeNotifications[currentIndex]?.flashTime || 8) * 1000;

      timeoutId = setTimeout(() => {
        // Start fade out
        setIsVisible(false);
        
        // After fade out completes, change content and fade back in
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % activeNotifications.length);
          setIsVisible(true);
        }, 300); // Fade out duration
      }, currentFlashTime);
    };

    scheduleNext();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeNotifications.length, activeNotifications, currentIndex]);

  // Reset visibility when notifications change
  useEffect(() => {
    setCurrentIndex(0);
    setIsVisible(true);
  }, [activeNotifications.length]);

  if (activeNotifications.length === 0 || !currentNotification) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 py-2 px-4">
      <div className="flex items-center min-h-[32px]">
        <span className="text-lg mr-3 flex-shrink-0">📢</span>
        <span 
          key={currentNotification.id}
          className={`text-sm text-blue-800 font-medium transition-opacity duration-300 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          dangerouslySetInnerHTML={{ __html: currentNotification.message }}
        />
      </div>
    </div>
  );
}