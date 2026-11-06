import { useEffect, useState } from "react";
import API from "../services/api";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/auth/profile");
        setUser(response.data.user || response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <p className="profile-error">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-top">
          <span className="profile-label">
            YOUR ACCOUNT
          </span>

          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <h1>{user.name}</h1>

          <p className="username">
            @{user.username}
          </p>

          <p className="profile-description">
            Welcome to your developer profile.
          </p>
        </div>

        <div className="profile-details">
          <h2>Personal Information</h2>

          <div className="profile-detail-item">
            <div>
              <strong>Full Name</strong>
              <p>{user.name || "Not available"}</p>
            </div>
          </div>

          <div className="profile-detail-item">
            <div>
              <strong>Email Address</strong>
              <p>{user.email || "Not available"}</p>
            </div>
          </div>

          <div className="profile-detail-item">
            <div>
              <strong>Username</strong>
              <p>@{user.username || "Not available"}</p>
            </div>
          </div>

          <div className="profile-detail-item">
            <div>
              <strong>About Me</strong>
              <p>{user.bio || "No bio added yet."}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;