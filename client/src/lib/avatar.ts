/**
 * Unified avatar utilities for displaying user profile pictures across the platform
 * Handles both VPS local storage and Replit object storage paths
 */

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
}

/**
 * Get the correct avatar URL for display
 * @param avatarPath - The avatar path from user data
 * @returns The correct URL for displaying the avatar
 */
export function getAvatarUrl(avatarPath?: string | null): string | null {
  if (!avatarPath) return null;
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http')) return avatarPath;
  
  // For VPS deployment: serve from /uploads
  if (avatarPath.startsWith('/uploads/')) {
    return avatarPath;
  }
  
  // For object storage (Replit): use API endpoint
  if (avatarPath.startsWith('/avatars/')) {
    return `/api/profile/avatar${avatarPath}`;
  }
  
  return avatarPath;
}

/**
 * Get user initials for fallback display
 * @param user - User object with firstName and lastName
 * @returns Formatted initials
 */
export function getUserInitials(user?: User | null): string {
  if (!user) return '?';
  
  const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
  
  return firstInitial + lastInitial || '?';
}

/**
 * Check if user has a valid avatar
 * @param user - User object
 * @returns boolean indicating if user has an avatar
 */
export function hasAvatar(user?: User | null): boolean {
  return !!(user?.avatar && getAvatarUrl(user.avatar));
}