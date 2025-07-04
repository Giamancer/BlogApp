import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchUserPosts = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const allPosts = data.posts || data;

        const myPosts = allPosts.filter(post => post.author?.email === user.email);
        setUserPosts(myPosts);
      } catch (err) {
        setError('Failed to fetch your posts');
        console.error('Fetch user posts error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post/${postId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      // If deleting post currently being edited, reset edit state
      if (editingPostId === postId) {
        setEditingPostId(null);
        setEditError('');
        setEditTitle('');
        setEditContent('');
      }
    } catch (err) {
      console.error('Delete post error:', err);
      alert('Failed to delete post');
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditError('');
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditError('');
  };

  const handleUpdatePost = async (postId) => {
    setEditLoading(true);
    setEditError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update post');
      }

      const updatedPost = await response.json();

      setUserPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
      setEditingPostId(null);
    } catch (err) {
      setEditError(err.message);
      console.error('Update post error:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status" aria-hidden="true"></div>
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="mb-1">{user?.username || 'User'}</h2>
                  <p className="mb-0">{user?.email || 'No email provided'}</p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <Link to="/create-post" className="btn btn-primary">
                    + Add New Post
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="card shadow">
        <div className="card-body p-4">
          <h3>Your Posts</h3>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {userPosts.length === 0 ? (
            <p className="text-muted">You have not created any posts yet.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {userPosts.map((post) => (
                <li
                  key={post._id}
                  className="list-group-item d-flex flex-column"
                >
                  {editingPostId === post._id ? (
                    <>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        disabled={editLoading}
                      />
                      <textarea
                        className="form-control mb-2"
                        rows="4"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        disabled={editLoading}
                      />
                      {editError && (
                        <div className="alert alert-danger">{editError}</div>
                      )}
                      <div>
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleUpdatePost(post._id)}
                          disabled={editLoading}
                        >
                          {editLoading ? 'Updating...' : 'Save'}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={cancelEditing}
                          disabled={editLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Link
                          to={`/post/${post._id}`}
                          className="text-decoration-none"
                        >
                          <strong>{post.title}</strong> <br />
                          <small className="text-muted">{formatDate(post.createdAt)}</small>
                        </Link>
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => startEditing(post)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
