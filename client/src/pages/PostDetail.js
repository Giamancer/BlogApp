import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Fetch comments with authorization header if token present
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comment/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data.comments || data || []);
    } catch (err) {
      console.error('Fetch comments error:', err);
      setComments([]);
    }
  }, [id, token]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data.post || data);
      } catch (err) {
        setError('Failed to fetch post');
        console.error('Fetch post error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [id, fetchComments, token]);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete comment');
      fetchComments();
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Failed to delete comment');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    setCommentError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, text: commentText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add comment');
      }

      setCommentText('');
      fetchComments();
    } catch (err) {
      setCommentError(err.message);
      console.error('Add comment error:', err);
    } finally {
      setCommentLoading(false);
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

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!post) return <p>No post found.</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <small className="text-muted">
        By {post.author?.username || 'Unknown'} • {formatDate(post.createdAt)}
      </small>
      <p className="mt-3">{post.content}</p>

      <hr />
      <h3>Comments</h3>
      {comments.length === 0 && <p>No comments yet.</p>}

      <ul className="list-group mb-4">
        {comments.map((comment) => {
          const isAuthor = user && comment.author?._id === user._id;
          // If you have admin info, you can add admin check here.

          return (
            <li key={comment._id || comment.id} className="list-group-item d-flex justify-content-between align-items-start">
              <div>
                <p className="mb-1">{comment.text || comment.content}</p>
                <small className="text-muted">
                  By {comment.author?.username || 'Unknown'} • {formatDate(comment.createdAt)}
                </small>
              </div>
              {isAuthor && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteComment(comment._id || comment.id)}
                >
                  Delete
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {user ? (
        <form onSubmit={handleAddComment}>
          {commentError && (
            <div className="alert alert-danger" role="alert">
              {commentError}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="commentText" className="form-label">
              Add a Comment
            </label>
            <textarea
              id="commentText"
              className="form-control"
              rows="3"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              disabled={commentLoading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={commentLoading}>
            {commentLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </button>
        </form>
      ) : (
        <p className="text-muted">Log in to add a comment.</p>
      )}
    </div>
  );
};

export default PostDetail;
