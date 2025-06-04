import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comment/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments || data || []);
    } catch (err) {
      console.error('Fetch comments error:', err);
      setComments([]);
    }
  }, [id, token]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error('Failed to fetch post');
        const data = await response.json();
        const p = data.post || data;
        setPost(p);
        setEditTitle(p.title);
        setEditContent(p.content);
      } catch (err) {
        setError('Failed to fetch post');
        console.error('Fetch post error:', err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError('');
    fetchPost();
    fetchComments();
  }, [id, fetchComments, token]);

  // Permission logic
  const isAuthor = user && post && post.author?.email === user.email;
  const isAdmin = user?.isAdmin;

  // canEdit: user authored the post
  const canEdit = isAuthor;

  // canDelete: user authored the post OR is admin
  const canDelete = isAuthor || isAdmin;

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete post');
      }

      alert('Post deleted successfully.');
      navigate('/'); // redirect after delete
    } catch (err) {
      console.error('Delete post error:', err);
      alert('Failed to delete post: ' + err.message);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    // Prevent admin from editing posts they don't own (extra safety)
    if (isAdmin && !isAuthor) {
      setEditError("Admins can't edit posts they don't own.");
      setEditLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/post/${id}`, {
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
      if (!updatedPost.author) {
        updatedPost.author = post.author; // keep old author info if not returned
      }
      setPost(updatedPost);
      setIsEditing(false);
      alert('Post updated successfully.');
    } catch (err) {
      setEditError(err.message);
      console.error('Update post error:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete comment');
      }

      fetchComments();
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Failed to delete comment: ' + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    setCommentError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comment/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to add comment');
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger mt-3">{error}</div>;
  if (!post) return <p className="mt-3">No post found.</p>;

  return (
    <div className="container mt-4">
      {isEditing ? (
        <>
          {/* Prevent admin from editing others' posts by disabling form and showing message */}
          {isAdmin && !isAuthor ? (
            <div className="alert alert-warning">
              Admins cannot edit posts they do not own.
            </div>
          ) : (
            <form onSubmit={handleUpdatePost}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={editLoading}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="5"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={editLoading}
                  required
                />
              </div>
              {editError && <div className="alert alert-danger">{editError}</div>}
              <button type="submit" className="btn btn-success me-2" disabled={editLoading}>
                {editLoading ? 'Updating...' : 'Update Post'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(post.title);
                  setEditContent(post.content);
                  setEditError('');
                }}
                disabled={editLoading}
              >
                Cancel
              </button>
            </form>
          )}
        </>
      ) : (
        <>
          <h2>{post.title}</h2>
          <p className="mb-4">{post.content}</p>

          {(canEdit || canDelete) && (
            <div className="mb-3">
              {/* Show Edit only if canEdit */}
              {canEdit && (
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Post
                </button>
              )}
              {/* Show Delete if canDelete */}
              {canDelete && (
                <button
                  className="btn btn-danger"
                  onClick={handleDeletePost}
                >
                  Delete Post
                </button>
              )}
            </div>
          )}

          {/* Comments */}
          <h3>Comments</h3>
          {comments.length === 0 && <p>No comments yet.</p>}
          <ul className="list-group mb-4">
            {comments.map((comment) => (
              <li
                key={comment._id || comment.id}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <p className="mb-1">{comment.text || comment.content}</p>
                  <small className="text-muted">{comment.author?.username || 'Anonymous'}</small>
                </div>

                {(user?.isAdmin || comment.author?.email === user?.email) && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteComment(comment._id || comment.id)}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Add comment form */}
          <form onSubmit={handleAddComment}>
            <div className="mb-3">
              <textarea
                className="form-control"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows="3"
                disabled={commentLoading}
              ></textarea>
            </div>
            {commentError && <div className="alert alert-danger">{commentError}</div>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={commentLoading}
            >
              {commentLoading ? 'Posting...' : 'Add Comment'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default PostDetail;
