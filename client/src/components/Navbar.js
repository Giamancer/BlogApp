import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [postId, setPostId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!postId.trim()) {
      setSearchError('Please enter a Post ID to search.');
      return;
    }

    setLoading(true);
    setSearchError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post/${postId.trim()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSearchError('Post not found.');
        } else {
          setSearchError('Failed to fetch post.');
        }
        setLoading(false);
        return;
      }

      const post = await response.json();

      navigate(`/post/${post._id}`);
      setPostId('');
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          BlogApp
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/create-post">
                Create Post
              </Link>
            </li>
          </ul>

          {/* Search by Post ID */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex align-items-center me-3"
            style={{ gap: '0.5rem', flexWrap: 'nowrap', color: 'white' }}
          >
            <label
              htmlFor="postIdSearch"
              className="mb-0 me-2"
              style={{ color: 'white', whiteSpace: 'nowrap' }}
            >
              Find Post by ID:
            </label>
            <input
              id="postIdSearch"
              type="text"
              placeholder="Post ID"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              className="form-control form-control-sm"
              style={{ minWidth: '150px' }}
              required
            />
            <button
              className="btn btn-sm btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {searchError && (
              <div className="text-danger small ms-3">{searchError}</div>
            )}
          </form>

          <ul className="navbar-nav">
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-haspopup="true"
                  type="button"
                >
                  {user.username}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      type="button"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
