import express from 'express';
import { protect, restrictToEmployer, restrictToJobseeker } from '../middleware/auth.js';
import {
    applyForJob,
    getMyApplications,
    getApplicationsForJob,
    updateApplicationStatus
} from '../controllers/applicationController.js';

const router = express.Router();

// Apply to a job (Jobseekers only)
router.post('/applications', protect, restrictToJobseeker, applyForJob);

// Get my applications (Jobseekers only)
router.get('/my-applications', protect, restrictToJobseeker, getMyApplications);

// Get applications for a specific job (Employers only)
router.get('/jobs/:jobId/applications', protect, restrictToEmployer, getApplicationsForJob);

// Update application status (Employers only)
router.patch('/applications/:id/status', protect, restrictToEmployer, updateApplicationStatus);

export default router;