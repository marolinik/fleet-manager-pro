import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '../middleware/rbac';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// GET documents for a vehicle
router.get('/vehicle/:vehicleId', checkPermission('documents', 'read'), async (req: any, res) => {
  const { vehicleId } = req.params;

  const documents = await prisma.document.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' }
  });

  res.json(documents);
});

// UPLOAD document
router.post('/upload', checkPermission('documents', 'create'), upload.single('file'), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'fleet-documents' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    }) as any;

    const document = await prisma.document.create({
      data: {
        vehicleId: req.body.vehicleId,
        type: req.body.type,
        name: req.body.name || req.file.originalname,
        documentUrl: result.secure_url,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null
      }
    });

    res.json(document);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

export default router;