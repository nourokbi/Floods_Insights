import { Outlet, Link, useLocation } from "react-router-dom";
import "./Layout.css";
import Navbar from "./Navbar";

export default function Layout() {
  const location = useLocation();
  const isAnalyzePage = location.pathname === "/analyze";

  return (
    <div className="layout">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      {!isAnalyzePage && (
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-copyright">
              &copy; 2025 Floods Insights. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
