import express from 'express';
import multer from 'multer';
import * as Minio from 'minio';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'devvault';

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit 5MB
  fileFilter: (req, file, cb) => {
    console.log(`[File Filter] Receiving file: ${file.originalname} (mimetype: ${file.mimetype})`);
    const filetypes = /jpeg|jpg|png|gif|webp|heic|heif|svg|ico/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp, heic, svg, ico)'));
  }
});

// Helper to ensure bucket exists and set policy
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket "${BUCKET_NAME}" created.`);
      
      // Set read-only public policy on bucket
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`Public read policy set for bucket "${BUCKET_NAME}".`);
    }
  } catch (error) {
    console.error('Error ensuring MinIO bucket exists:', error);
  }
}

// Initial bucket setup attempt
ensureBucket();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    await ensureBucket(); // Double check bucket exists

    const originalName = req.file.originalname;
    const extension = path.extname(originalName);
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const cleanFileName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
    const objectName = `${Date.now()}-${uniqueSuffix}-${cleanFileName}`;

    // Upload buffer to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      objectName,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype }
    );

    // Construct public URL
    const publicUrl = `http://localhost:${process.env.MINIO_PORT || 9000}/${BUCKET_NAME}/${objectName}`;

    res.status(200).json({
      url: publicUrl,
      fileName: objectName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

export default router;
