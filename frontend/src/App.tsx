import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { PostForm } from './components/PostForm';
import type { Role } from './types';
import { RoleEnum } from './types';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: Role[] }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole && !requiredRole.includes(userRole)) {
    return <Navigate to="/posts" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/posts"
        element={
          <>
            <Navbar />
            <PostList />
          </>
        }
      />
      <Route
        path="/posts/:id"
        element={
          <>
            <Navbar />
            <PostDetail />
          </>
        }
      />
      <Route
        path="/posts/new"
        element={
          <ProtectedRoute requiredRole={[RoleEnum.admin, RoleEnum.blog_writer]}>
            <Navbar />
            <PostForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts/:id/edit"
        element={
          <ProtectedRoute requiredRole={[RoleEnum.admin, RoleEnum.blog_writer]}>
            <Navbar />
            <PostForm />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/posts" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
