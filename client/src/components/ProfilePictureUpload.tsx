import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Upload, User } from "lucide-react";

interface ProfilePictureUploadProps {
  currentAvatar?: string | null;
  userId: string;
  onAvatarUpdate?: (newAvatarPath: string) => void;
}

export function ProfilePictureUpload({ currentAvatar, userId, onAvatarUpdate }: ProfilePictureUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (1MB max)
      if (file.size > 1 * 1024 * 1024) {
        throw new Error('Image must be 300x300 pixels and up to 1MB');
      }

      // Validate and resize image to 300x300
      const resizedFile = await resizeImage(file, 300, 300);

      // Get upload URL
      const { uploadURL } = await apiRequest('/api/profile/upload-url', {
        method: 'POST',
      });

      // Upload file directly to storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: resizedFile,
        headers: {
          'Content-Type': resizedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // Update user profile with new avatar path
      const { avatarPath } = await apiRequest('/api/profile/avatar', {
        method: 'PUT',
        body: { avatarURL: uploadURL },
      });

      return avatarPath;
    },
    onSuccess: (avatarPath) => {
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
      onAvatarUpdate?.(avatarPath);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsOpen(false);
      setSelectedFile(null);
      setPreview(null);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be 300x300 pixels and up to 1MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Change Picture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture. Images will be resized to 300x300 pixels.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current avatar preview */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : currentAvatar ? (
                <img src={currentAvatar} alt="Current avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>

          {/* File input */}
          <div className="space-y-2">
            <Label htmlFor="avatar-upload">Select Image</Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500">
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to resize image to exact dimensions
function resizeImage(file: File, width: number, height: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate aspect ratio and crop to fit
      const sourceAspect = img.width / img.height;
      const targetAspect = width / height;

      let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

      if (sourceAspect > targetAspect) {
        // Image is wider, crop sides
        sourceWidth = img.height * targetAspect;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        // Image is taller, crop top/bottom
        sourceHeight = img.width / targetAspect;
        sourceY = (img.height - sourceHeight) / 2;
      }

      // Draw and resize the image
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, width, height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create blob from canvas'));
          return;
        }

        const resizedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });

        resolve(resizedFile);
      }, file.type, 0.9);
    };

    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
}