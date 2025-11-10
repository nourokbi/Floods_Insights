import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { Sun, Moon, User, Bookmark, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const [theme, setTheme] = useState("light");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  function handleThemeToggle() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  function toggleDropdown() {
    setIsDropdownOpen(!isDropdownOpen);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span className="logo-text">Floods Insights</span>
          </div>

          <ul className="navbar-links">
            <li>
              <Link to="/" className="nav-link active">
                Home
              </Link>
            </li>
            <li>
              <Link to="/history" className="nav-link">
                History of Floods
              </Link>
            </li>
            <li>
              <Link to="/analyze" className="nav-link">
                Analyze
              </Link>
            </li>
            <li>
              <Link to="/learn" className="nav-link">
                Learn
              </Link>
            </li>
            <li>
              <Link to="/about" className="nav-link">
                About Us
              </Link>
            </li>
          </ul>
          <div className="actions">
            <button
              className="theme-switcher"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon /> : <Sun />}
            </button>

            {/* User Action Dropdown */}
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-menu-button"
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                <User />
              </button>

              <div className={`user-dropdown ${isDropdownOpen ? "open" : ""}`}>
                <div className="user-dropdown-header">
                  <div className="user-avatar">
                    <User size={32} />
                  </div>
                  <div className="user-info">
                    <p className="user-name">User Name</p>
                    <p className="user-email">user@example.com</p>
                  </div>
                </div>

                <div className="user-dropdown-divider"></div>

                <ul className="user-dropdown-menu">
                  <li>
                    <button className="user-dropdown-item">
                      <Bookmark size={18} />
                      <span>Saved</span>
                    </button>
                  </li>
                  <li>
                    <button className="user-dropdown-item">
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                  </li>
                  <li>
                    <button className="user-dropdown-item logout">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
