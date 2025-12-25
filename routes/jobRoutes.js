import express from "express";
import Job from "../models/Job.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all jobs with optional search/filter
router.get("/", protect, async (req, res) => {
  try {
    const { company, status } = req.query;
    let query = { userId: req.user._id };
    if (company) query.company = { $regex: company, $options: "i" };
    if (status) query.status = status;

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get stats
router.get("/stats", protect, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id });
    const stats = { Applied: 0, Interview: 0, Rejected: 0, Offer: 0 };
    jobs.forEach((job) => {
      if (stats[job.status] !== undefined) stats[job.status]++;
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add job
router.post("/", protect, async (req, res) => {
  try {
    const { company, role, status } = req.body;
    const newJob = await Job.create({ company, role, status, userId: req.user._id });
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update job
router.put("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const { company, role, status, favorite } = req.body;
    job.company = company ?? job.company;
    job.role = role ?? job.role;
    job.status = status ?? job.status;
    job.favorite = favorite ?? job.favorite;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete job
router.delete("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    await job.remove();
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
