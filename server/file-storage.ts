import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import sharp from 'sharp';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${userId}-${timestamp}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'));
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  }
});

export async function processAvatarImage(filePath: string): Promise<string> {
  const processedPath = filePath.replace(/\.[^/.]+$/, '-processed.jpg');
  
  await sharp(filePath)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 90 })
    .toFile(processedPath);
  
  // Delete original file
  fs.unlinkSync(filePath);
  
  return processedPath;
}

export function getAvatarUrl(avatarPath: string): string {
  if (!avatarPath) return '';
  
  // For VPS deployment, serve from public folder
  if (avatarPath.startsWith('/uploads/')) {
    return avatarPath;
  }
  
  // For object storage (Replit), use API endpoint
  if (avatarPath.startsWith('/avatars/')) {
    return `/api/profile/avatar${avatarPath}`;
  }
  
  return avatarPath;
}