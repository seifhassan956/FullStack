import path from 'path';
import fs from 'fs';
import crypto from 'crypto'; 
import express from 'express';
import multer from 'multer';

const router = express.Router();
const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/mpeg', 'video/quicktime'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

export const upload = multer({ storage, fileFilter });
export const uploadSingleImage = upload.single('image');

export const preventDuplicateUpload = (req, res, next) => {
    if (!req.file) return next();

    const hash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
    const ext = path.extname(req.file.originalname);

    const existingFiles = fs.readdirSync(uploadDir);
    const duplicate = existingFiles.find((filename) => filename.startsWith(hash));

    if (duplicate) {
        req.file.isDuplicate = true;
        req.file.savedPath = `/uploads/${duplicate}`;
        return next();
    }

    const uniqueName = `${hash}-${req.user?._id || 'unknown'}-${Date.now()}${ext}`;
    const savePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(savePath, req.file.buffer);
    req.file.filename = uniqueName;
    req.file.savedPath = `/uploads/${uniqueName}`;

    next();
};

router.post('/', uploadSingleImage, preventDuplicateUpload, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.isDuplicate) {
        return res.status(409).json({
            message: 'This image has already been uploaded',
            image: req.file.savedPath,
        });
    }

    return res.status(200).json({
        message: 'Uploaded successfully',
        image: req.file.savedPath,
    });
});

export default router;