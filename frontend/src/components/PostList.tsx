import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import type { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleEnum } from '../types';

export const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const { userRole } = useAuth();
  const canEdit = userRole === RoleEnum.admin || userRole === RoleEnum.blog_writer;
  const canDelete = userRole === RoleEnum.admin;

  useEffect(() => {
    fetchPosts();
  }, [skip, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postsAPI.getPosts(limit, skip, searchTerm);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postsAPI.deletePost(id);
      fetchPosts();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete post');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchPosts();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-2xl font-bold text-gray-900 hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-2 text-gray-600 line-clamp-3">{post.content}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>By {post.owner.email}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    {post.vote && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{post.vote} likes</span>
                      </>
                    )}
                  </div>
                </div>
                {(canEdit || canDelete) && (
                  <div className="ml-4 flex gap-2">
                    {canEdit && (
                      <Link
                        to={`/posts/${post.id}/edit`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => post.id && handleDelete(post.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setSkip(Math.max(0, skip - limit))}
          disabled={skip === 0}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setSkip(skip + limit)}
          disabled={posts.length < limit}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

