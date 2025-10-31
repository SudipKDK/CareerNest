import Application from '../models/application.js';
import Job from '../models/jobs.js';

export const applyForJob = async (req, res) => {
    try {
        const { jobId, coverLetter, resume } = req.body;

        // 1. Validate input fields
        if (!jobId || !coverLetter || !resume) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // 2. Check if user is jobseeker
        if (req.user.userType !== 'jobseeker') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only jobseekers can apply to jobs."
            });
        }

        // 3. Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // 4. Check if already applied (optional - index will also prevent this)
        const existingApplication = await Application.findOne({
            jobs: jobId,
            user: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied to this job"
            });
        }

        // 5. Create application
        const application = new Application({
            jobs: jobId,
            user: req.user._id,
            coverLetter: coverLetter,
            resume: resume,
            status: 'pending'
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application: application
        });

    } catch (error) {
        console.error("Apply error:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting application"
        });
    }
}
export const getMyApplications = async (req, res) => {
    try {
        const application = await Application.find({ user: req.user._id })
            .populate('jobs', 'title company location jobType salary')
            .sort({ appliedAt: -1 });
        res.status(200).json({
            success: true,
            count: application.length,
            applications: application
        });
    } catch (error) {
        console.error("Get my applications error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching applications"
        });
    }
}
export const getApplicationsForJob = async (req, res) =>{
    try{
        const {jobId} = req.params;
        
        // Step 1: Verify job exists
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        
        // Step 2: Check if the job belongs to the logged-in employer
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view applications for this job"
            });
        }
        
        // Step 3: Get all applications for this job
        const applications = await Application.find({ jobs: jobId })
            .populate('user', 'firstName lastName email phone')
            .sort({ appliedAt: -1 });
        
        // Step 4: Return the applications
        res.status(200).json({
            success: true,
            count: applications.length,
            applications: applications
        });
        
    } catch (error) {
        console.error("Get applications for job error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching applications"
        });
    }
};
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        // Step 1: Find the application
        const application = await Application.findById(id);
        if(!application){
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }
        
        // Step 2: Verify the job belongs to the employer
        const job = await Job.findById(application.jobs);
        if(!job){
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        
        if(job.postedBy.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this application"
            });
        }
        
        // Step 3: Validate status if provided
        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: pending, reviewed, accepted, rejected"
            });
        }
        
        // Step 4: Update the application
        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            { status: status, notes: notes },
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email');
        
        // Step 5: Return success response
        res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            application: updatedApplication
        });
        
    } catch (error) {
        console.error("Update application status error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating application status"
        });
    }
};