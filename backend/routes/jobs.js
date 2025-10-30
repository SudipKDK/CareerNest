import express from 'express';
import { protect }from '../middleware/auth.js'

import {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    getMyJobs
} from '../controllers/jobController.js'

const router =express.Router();

router.get('/jobs',getAllJobs);

router.get('/jobs/:id',getJobById);

router.post('/jobs',protect,createJob);

router.get('/my-jobs',protect,getMyJobs);

router.put('/jobs/:id',protect,updateJob);

router.delete('/jobs/:id', protect, deleteJob);

export default router;