import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar" data-current-path={location.pathname}>
      <Link to="/" className="logo">
        Hashnode
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>

            <Link to="/write">Write Article</Link>

            <Link to="/profile">Profile</Link>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;