import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI, commentsAPI, votesAPI } from '../services/api';
import type { Post, Comment, CommentCreate } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleEnum } from '../types';

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const fetchPostAndComments = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Get all posts and find the one with matching ID
      const allPosts = await postsAPI.getPosts(100, 0, '');
      const foundPost = allPosts.find((p) => p.id === parseInt(id));
      
      if (foundPost) {
        setPost(foundPost);
        const postComments = await commentsAPI.getComments(parseInt(id));
        setComments(postComments);
      } else {
        navigate('/posts');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment: CommentCreate = { text: commentText };
      const comment = await commentsAPI.createComment(parseInt(id), newComment);
      setComments([...comments, comment]);
      setCommentText('');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleVote = async () => {
    if (!id || !post) return;

    setVoting(true);
    try {
      const isVoted = post.vote && post.vote > 0;
      await votesAPI.vote({
        post_id: parseInt(id),
        dir: isVoted ? 0 : 1,
      });
      
      // Update post vote count
      setPost({
        ...post,
        vote: isVoted ? (post.vote || 1) - 1 : (post.vote || 0) + 1,
      });
      
      fetchPostAndComments();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Post not found</div>
      </div>
    );
  }

  const canComment = isAuthenticated && userRole === RoleEnum.viewer;
  const hasVoted = post.vote && post.vote > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/posts" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
        ← Back to posts
      </Link>

      <article className="bg-white shadow rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span>By {post.owner.email}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          {post.vote !== undefined && (
            <>
              <span className="mx-2">•</span>
              <span>{post.vote} likes</span>
            </>
          )}
        </div>

        {post.photo_path && (
          <img
            src={`http://localhost:5000/${post.photo_path}`}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {isAuthenticated && userRole === RoleEnum.viewer && (
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleVote}
              disabled={voting}
              className={`px-4 py-2 rounded-md font-medium ${
                hasVoted
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              {voting ? 'Processing...' : hasVoted ? '✓ Liked' : 'Like'}
            </button>
          </div>
        )}
      </article>

      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

        {canComment && (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              required
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submittingComment ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>
        )}

        {!canComment && !isAuthenticated && (
          <p className="text-gray-500 mb-6">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800">
              Sign in
            </Link>{' '}
            as a viewer to comment.
          </p>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-900">{comment.user.email}</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

