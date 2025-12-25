import { useEffect, useState } from "react";
import api from "../services/api";
import JobForm from "../components/JobForm";
import "../css/Dashboard.css"; 
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [searchCompany, setSearchCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [stats, setStats] = useState({ Applied: 0, Interview: 0, Rejected: 0, Offer: 0 });

  const navigate = useNavigate();

  // Fetch jobs with optional filter
  const fetchJobs = async (company = "", status = "") => {
    try {
      const res = await api.get("/jobs", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        params: { company, status },
      });
      setJobs(res.data);
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/jobs/stats", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setStats(res.data);
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  // Async-safe useEffect to avoid cascading renders
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchJobs(), fetchStats()]);
    };
    fetchData();
  }, []);

  const addJob = async (job) => {
    try {
      const res = await api.post("/jobs", job, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setJobs(prev => [...prev, res.data]);
      fetchStats();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Error adding job");
    }
  };

  const updateJob = async (id, updatedJob) => {
    try {
      const res = await api.put(`/jobs/${id}`, updatedJob, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setJobs(prev => prev.map(job => job._id === id ? res.data : job));
      fetchStats();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Error updating job");
    }
  };

  const deleteJob = async (id) => {
    try {
      await api.delete(`/jobs/${id}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setJobs(prev => prev.filter(job => job._id !== id));
      fetchStats();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Error deleting job");
    }
  };

  const toggleFavorite = (job) => {
    updateJob(job._id, { favorite: !job.favorite });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(searchCompany, filterStatus);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <span>Applied: {stats.Applied}</span>
        <span>Interview: {stats.Interview}</span>
        <span>Rejected: {stats.Rejected}</span>
        <span>Offer: {stats.Offer}</span>
      </div>

      {/* Search / Filter */}
      <form className="job-filter" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by Company"
          value={searchCompany}
          onChange={(e) => setSearchCompany(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>Applied</option>
          <option>Interview</option>
          <option>Rejected</option>
          <option>Offer</option>
        </select>
        <button type="submit">Filter</button>
      </form>

      {/* Job Form */}
      <JobForm
        jobs={jobs}
        onAdd={addJob}
        onUpdate={updateJob}
        onToggleFavorite={toggleFavorite}
        onDelete={deleteJob}
      />
    </div>
  );
}

export default Dashboard;
