import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminPanel.module.css"; // Adjust the path if necessary
import ReportFormadmin from "./ReportFormadmin";
const AdminPanel = () => {
  const [reports, setReports] = useState([]);

  // Fetch reports for admin to review
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reports");
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // Delete a report
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reports/${id}`);
      setReports(reports.filter((report) => report.id !== id)); // Remove deleted report from the UI
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div className={styles.adminPanelContainer}>
      <h2>Admin Panel</h2>
      <h3>Pending Reports</h3>
      {reports.length > 0 ? (
        <ul className={styles.reportList}>
          {reports.map((report) => (
            <li key={report.id}>
              <p>
                <strong>Message:</strong> {report.message}
              </p>
              <button onClick={() => handleDelete(report.id)}>
                Delete Report
              </button>
            </li>
            
          ))}
        </ul>
      ) : (
        <p className={styles.noReports}>No pending reports</p>
      )}

      <ReportFormadmin/>
    </div>
  );
};

export default AdminPanel;
