import { cn } from "@/lib/utils";
import { getAvatarUrl, getUserInitials, hasAvatar, type User } from "@/lib/avatar";

interface UserAvatarProps {
  user?: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm', 
  lg: 'w-10 h-10 text-sm',
  xl: 'w-16 h-16 text-lg'
};

/**
 * Unified user avatar component that displays either the user's profile picture
 * or their initials as a fallback. Works with both VPS and Replit storage.
 */
export function UserAvatar({ 
  user, 
  size = 'md', 
  className,
  showFallback = true 
}: UserAvatarProps) {
  const avatarUrl = getAvatarUrl(user?.avatar);
  const initials = getUserInitials(user);
  const baseClasses = `${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden`;

  if (avatarUrl) {
    return (
      <div className={cn(baseClasses, className)}>
        <img 
          src={avatarUrl}
          alt={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show fallback
            if (showFallback) {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                    <span class="text-white font-bold ${size === 'sm' ? 'text-xs' : size === 'lg' || size === 'xl' ? 'text-sm' : 'text-sm'}">${initials}</span>
                  </div>
                `;
              }
            }
          }}
        />
      </div>
    );
  }

  if (showFallback) {
    return (
      <div className={cn(baseClasses, 'bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center', className)}>
        <span className="text-white font-bold">
          {initials}
        </span>
      </div>
    );
  }

  return null;
}