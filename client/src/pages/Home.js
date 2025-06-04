import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/post');
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await res.json();
      setPosts(data.posts || data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching posts:', err);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-4 mb-3">Welcome to BlogApp</h1>
          <p className="lead text-muted">
            Discover amazing stories and share your thoughts with the community.
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center mt-5">
          <h3 className="text-muted">No posts yet</h3>
          <p className="text-muted">Be the first to share your story!</p>
          <Link to="/create-post" className="btn btn-primary">
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="row">
          {posts.map((post) => (
            <div key={post._id} className="col-lg-6 col-md-12 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <Link to={`/post/${post._id}`} className="text-decoration-none">
                      {post.title}
                    </Link>
                  </h5>
                  <p className="card-text text-muted">
                    {post.content.length > 150
                      ? `${post.content.substring(0, 150)}...`
                      : post.content}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <small className="text-muted">
                    By {post.author?.username || 'Unknown'} • {formatDate(post.createdAt)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
