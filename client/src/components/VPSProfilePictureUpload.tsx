import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface VPSProfilePictureUploadProps {
  currentAvatar?: string | null;
  userId: string;
  onAvatarUpdate?: (newAvatarPath: string) => void;
}

export function VPSProfilePictureUpload({ 
  currentAvatar, 
  userId, 
  onAvatarUpdate 
}: VPSProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Image must be 300x300 pixels and up to 1MB (JPG, PNG, GIF, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be 300x300 pixels and up to 1MB.",
        variant: "destructive",
      });
      return;
    }

    // Upload directly without preview
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include session cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      toast({
        title: "Profile picture updated",
        description: "Image resized to 300x300 pixels and saved successfully.",
      });

      // Update the auth context with new user data
      if (result.user) {
        login(result.user);
      }

      // Notify parent component
      if (onAvatarUpdate && result.avatarPath) {
        onAvatarUpdate(result.avatarPath);
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };





  return (
    <div className="text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        className="gap-1"
        disabled={isUploading}
      >
        <Camera className="w-4 h-4" />
        {isUploading ? "Uploading..." : "Change Picture"}
      </Button>
      <p className="text-xs text-gray-500 mt-1">
        300x300 pixels • Up to 1MB • JPG, PNG, GIF, WebP
      </p>
    </div>
  );
}