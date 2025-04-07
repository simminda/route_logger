import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/images/logo.png";

const Sidebar = ({ darkMode, handleToggleDarkMode }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="sidebar">
      <div className="logo-name">
        <div className="logo-image">
          <img src={logo} alt="ELD Logo" />
        </div>
        <span className="logo_name">RouteLogger</span>
      </div>
      <div className="menu-items">
        <ul className="nav-links">
          <li><Link to="/dashboard"><i className="uil uil-dashboard"></i><span>Dashboard</span></Link></li>
          <li className="active"><Link to="/new-trip"><i className="uil uil-plus-circle"></i><span>New Trip</span></Link></li>
          <li><Link to="/trip-history"><i className="uil uil-history"></i><span>Trip History</span></Link></li>
          <li><Link to="/logs"><i className="uil uil-file-alt"></i><span>ELD Logs</span></Link></li>
          <li className="disabled"><Link to="/map"><i className="uil uil-map"></i><span>Map View</span></Link></li>
          <li className="disabled"><Link to="/settings"><i className="uil uil-setting"></i><span>Settings</span></Link></li>
          <li className="disabled"><Link to="/help"><i className="uil uil-question-circle"></i><span>Help & Resources</span></Link></li>
        </ul>
        
        {/* Authentication Links */}
        <ul className="logout-mode">
          {isAuthenticated ? (
            <li><a href="#" onClick={handleLogout}><i className="uil uil-signout"></i><span>Logout</span></a></li>
          ) : (
            <>
              <li><Link to="/login"><i className="uil uil-signin"></i><span>Login</span></Link></li>
              <li><Link to="/register"><i className="uil uil-user-plus"></i><span>Register</span></Link></li>
            </>
          )}
          
          <li className="mode">
            <a href="#" onClick={handleToggleDarkMode}>
              <i className={`uil ${darkMode ? "uil-sun" : "uil-moon"}`}></i>
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </a>
            <div className="mode-toggle">
              <span className={`switch ${darkMode ? "active" : ""}`}></span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
