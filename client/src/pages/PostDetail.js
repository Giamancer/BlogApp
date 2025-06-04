import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const PostDetail = () => {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/comment/${id}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments || data || []);
    } catch (err) {
      console.error('Fetch comments error:', err);
      setComments([]);
    }
  }, [id]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/post/${id}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        const data = await response.json();
        setPost(data.post || data);
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
  }, [id, fetchComments]);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/comment/${commentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete comment');
      fetchComments();
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Failed to delete comment');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>No post found.</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>

      <h3>Comments</h3>
      {comments.length === 0 && <p>No comments yet.</p>}
      <ul>
        {comments.map((comment) => (
          <li key={comment._id || comment.id}>
            <p>{comment.text || comment.content}</p>
            <button onClick={() => handleDeleteComment(comment._id || comment.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostDetail;
