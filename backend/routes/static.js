import express from 'express';
import path from 'path';

const router = express.Router();

router.use(express.static(path.join(process.cwd(), '../frontend')));

export default router;

