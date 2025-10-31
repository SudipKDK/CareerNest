import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobs:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter:{
        type: String,
        required: true
    },
    resume:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['pending','reviewed', 'accepted', 'rejected'],
        default: 'pending'
    },
    notes:{
        type: String,
    },
    appliedAt:{
        type: Date,
        default: Date.now
    }
},
{ timestamps: true }
);

// Create compound unique index to prevent duplicate applications
// This ensures a user can only apply to the same job once
applicationSchema.index({ jobs: 1, user: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;