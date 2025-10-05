import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { AuthUser } from "../../types";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { VPSProfilePictureUpload } from "@/components/VPSProfilePictureUpload";
import { useState } from "react";
import { User as UserIcon } from "lucide-react";

interface ProfileSidebarProps {
  user: AuthUser | null;
}

export default function ProfileSidebar({ user }: ProfileSidebarProps) {
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar);
  
  const getInitials = () => {
    if (!user) return "?";
    return (user.firstName[0] || "") + (user.lastName[0] || "");
  };

  const getAvatarUrl = () => {
    if (!currentAvatar) return null;
    // If it's already a full URL, return as is
    if (currentAvatar.startsWith('http')) return currentAvatar;
    
    // For VPS deployment: serve from /uploads
    if (currentAvatar.startsWith('/uploads/')) {
      return currentAvatar;
    }
    
    // For object storage (Replit): use API endpoint
    if (currentAvatar.startsWith('/avatars/')) {
      return `/api/profile/avatar${currentAvatar}`;
    }
    
    return currentAvatar;
  };

  const handleAvatarUpdate = (newAvatarPath: string) => {
    setCurrentAvatar(newAvatarPath);
  };

  // Get user statistics
  const { data: userStats } = useQuery<{
    totalSites: number;
    completedExchanges: number;
    successfulOrders: number;
  }>({
    queryKey: ["/api/users", user?.id, "stats"],
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-8">
      {/* Profile Avatar */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Profile Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gray-100 flex items-center justify-center">
              {getAvatarUrl() ? (
                <img 
                  src={getAvatarUrl()!} 
                  alt="Profile avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full bg-primary rounded-full flex items-center justify-center ${getAvatarUrl() ? 'hidden' : ''}`}
              >
                <span className="text-white font-bold text-2xl">
                  {getInitials()}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {user?.firstName} {user?.lastName}
            </h3>
            <div className="flex justify-center mb-4">
              {user && (
                <VPSProfilePictureUpload
                  currentAvatar={getAvatarUrl()}
                  userId={user.id}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {getAvatarUrl() ? 'Profile picture uploaded' : 'Upload a profile picture or display your initials'}
            </p>
            
            {/* Account Statistics */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{userStats?.totalSites || 0}</div>
                  <div className="text-xs text-gray-600">Sites</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{userStats?.completedExchanges || 0}</div>
                  <div className="text-xs text-gray-600">Exchanges</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{userStats?.successfulOrders || 0}</div>
                  <div className="text-xs text-gray-600">Orders</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">SMS Notifications</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Exchange Updates</span>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
