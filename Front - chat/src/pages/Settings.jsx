import { User, Mail, Calendar, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Settings.css";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-description">Your account information</p>
        </div>

        {/* User Profile Section */}
        <div className="settings-section">
          <h2 className="section-title">Profile Information</h2>

          <div className="profile-card">
            <div className="profile-avatar">
              <User size={64} />
            </div>

            <div className="profile-info">
              <h3 className="profile-name">{user?.name || "Guest"}</h3>
              <p className="profile-role">{user?.role || "User"}</p>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">
                <Mail size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Email Address</label>
                <p className="info-value">{user?.email || "Not available"}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Shield size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Role</label>
                <p className="info-value">{user?.role || "User"}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Calendar size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Member Since</label>
                <p className="info-value">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
