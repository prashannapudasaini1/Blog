import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsAPI } from '../services/api';
import type { PostCreate } from '../types';

export const PostForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      fetchPost();
    }
  }, [id, isEdit]);

  const fetchPost = async () => {
    if (!id) return;
    
    setLoadingPost(true);
    try {
      const allPosts = await postsAPI.getPosts(100, 0, '');
      const post = allPosts.find((p) => p.id === parseInt(id));
      
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setPublished(post.published);
      } else {
        navigate('/posts');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/posts');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData: PostCreate = {
        title,
        content,
        published,
      };

      if (isEdit && id) {
        await postsAPI.updatePost(parseInt(id), postData);
      } else {
        await postsAPI.createPost(postData);
      }

      navigate('/posts');
    } catch (error: any) {
      alert(error.response?.data?.detail || `Failed to ${isEdit ? 'update' : 'create'} post`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Post' : 'Create New Post'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter post title"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write your post content here..."
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Published</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Post' : 'Create Post')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

