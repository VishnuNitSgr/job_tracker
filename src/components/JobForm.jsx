import { useState, useEffect } from "react";
import "../css/JobForm.css";

function JobForm({ jobs, onAdd, onUpdate, onToggleFavorite, onDelete }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [editJob, setEditJob] = useState(null);

  // Effect runs **only when editJob changes**, and state update is safe
  useEffect(() => {
    if (!editJob) return; // nothing to do if no editJob
    const populateFields = () => {
      setCompany(editJob.company);
      setRole(editJob.role);
      setStatus(editJob.status);
    };
    // Schedule state updates after render
    const timer = setTimeout(populateFields, 0);
    return () => clearTimeout(timer);
  }, [editJob]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!company || !role) return alert("Company and Role are required");

    const jobData = { company, role, status };

    if (editJob) {
      onUpdate(editJob._id, jobData);
      setEditJob(null);
    } else {
      onAdd(jobData);
    }

    setCompany("");
    setRole("");
    setStatus("Applied");
  };

  const startEdit = (job) => {
    setEditJob(job);
  };

  return (
    <div className="job-form-container">
      <form className="job-form" onSubmit={submitHandler}>
        <h3>{editJob ? "Edit Job" : "Add Job"}</h3>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          required
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role"
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Applied</option>
          <option>Interview</option>
          <option>Rejected</option>
          <option>Offer</option>
        </select>
        <button type="submit">{editJob ? "Update" : "Add"}</button>
      </form>

      <ul className="job-list">
        {jobs.map((job) => (
          <li key={job._id} className={job.favorite ? "favorite-job" : ""}>
            <span>
              {job.company} - {job.role} ({job.status})
            </span>
            <div className="job-actions">
              <button onClick={() => startEdit(job)}>Edit</button>
              <button onClick={() => onDelete(job._id)}>Delete</button>
              <button onClick={() => onToggleFavorite(job)}>
                {job.favorite ? "Unfavorite" : "Favorite"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobForm;
