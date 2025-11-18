import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";
import TeamSection from "../components/about-us/TeamSection";

export default function AboutUs() {
  const navigate = useNavigate();


  return (
    <div className="simple-about-page">
      <header className="simple-about-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
          <h1 className="simple-title">Meet Our Team</h1>
          <p className="simple-description">
            The five developers behind Floods Insights.
          </p>
        </div>
      </header>

      <TeamSection />
    </div>
  );
}