import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import "./Settings.css";

export default function Settings() {
  // Dummy user data
  const [userData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    joinDate: "January 15, 2024",
    role: "Emergency Response Coordinator",
    organization: "NYC Emergency Management",
    department: "Flood Response Team",
  });

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-description">
            Manage your account information and preferences
          </p>
        </div>

        {/* User Profile Section */}
        <div className="settings-section">
          <h2 className="section-title">Profile Information</h2>

          <div className="profile-card">
            <div className="profile-avatar">
              <User size={64} />
            </div>

            <div className="profile-info">
              <h3 className="profile-name">{userData.name}</h3>
              <p className="profile-role">{userData.role}</p>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">
                <Mail size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Email Address</label>
                <p className="info-value">{userData.email}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Phone size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Phone Number</label>
                <p className="info-value">{userData.phone}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <MapPin size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Location</label>
                <p className="info-value">{userData.location}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Calendar size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Member Since</label>
                <p className="info-value">{userData.joinDate}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Shield size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Organization</label>
                <p className="info-value">{userData.organization}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <User size={20} />
              </div>
              <div className="info-content">
                <label className="info-label">Department</label>
                <p className="info-value">{userData.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button className="btn btn-primary">Edit Profile</button>
          <button className="btn btn-secondary">Change Password</button>
        </div>
      </div>
    </div>
  );
}
