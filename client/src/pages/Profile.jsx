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

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>Profile not found.</p>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <h1>{user.name}</h1>
        <p className="username">@{user.username}</p>

        <div className="profile-details">
          <div>
            <strong>Email</strong>
            <p>{user.email}</p>
          </div>

          <div>
            <strong>Username</strong>
            <p>{user.username}</p>
          </div>

          <div>
            <strong>Bio</strong>
            <p>{user.bio || "No bio added yet."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;