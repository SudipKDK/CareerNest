import Job from '../models/jobs.js'

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('postedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs: jobs
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error fetching jobs"
        });
    }
}

export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'firstName lastName email company')
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'job not found'
            })
        }
        res.status(200).json({
            success: true,
            message: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error fetching job"
        });
    }
};

export const createJob = async (req, res) => {
    try {
        // reading data from frontend
        const { title, company, location, description, jobType, salary, skills, category } = req.body;
        //validation
        if (!title || !company || !location || !description || !category) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        //create job with authenticated user's id
        const job = new Job({
            title,
            company,
            location,
            description,
            jobType: jobType || 'full-time',
            salary,
            skills,
            category,
            postedBy: req.user._id
        });
        await job.save();
        res.status(201).json({
            success: true,
            message: "Job created successfully",
            job: job
        })
    } catch (error) {
        console.error("Create job error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating job"
        });
    }
}
//update job
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        //chack if logged in user is one who posted the job
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this job"
            });
        }
        //update job
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }

        )

        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            job: updatedJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating job"
        });
    }

}

//delete job
export const deleteJob = async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found"
        });
      }
      
      // Check ownership
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this job"
        });
      }
      
      await Job.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        success: true,
        message: "Job deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting job"
      });
    }
  };
  export const getMyJobs = async (req, res) => {
    try {
      // Find only jobs posted by the logged-in user
      const jobs = await Job.find({ postedBy: req.user._id })
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: jobs.length,
        jobs: jobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching your jobs"
      });
    }
  };