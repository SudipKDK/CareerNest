import express from 'express';
import path from 'path';

const router = express.Router();

// Serve static files from frontend directory
router.use(express.static(path.join(process.cwd(), '../frontend')));

// API endpoint to test backend connection
router.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is connected successfully!',
        timestamp: new Date().toLocaleString()
    });
});

export default router;

