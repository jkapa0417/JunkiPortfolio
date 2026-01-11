import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import HomePage from './pages/HomePage';
import CareerPage from './pages/CareerPage';
import SkillsPage from './pages/SkillsPage';
import ProjectsPage from './pages/ProjectsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogEditorPage from './pages/BlogEditorPage';
import ContactPage from './pages/ContactPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AdminDashboard from './pages/AdminDashboard';

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'career',
                element: <CareerPage />,
            },
            {
                path: 'skills',
                element: <SkillsPage />,
            },
            {
                path: 'projects',
                element: <ProjectsPage />,
            },
            {
                path: 'blog',
                element: <BlogPage />,
            },
            {
                path: 'blog/new',
                element: <BlogEditorPage />,
            },
            {
                path: 'blog/edit/:slug',
                element: <BlogEditorPage />,
            },
            {
                path: 'blog/:slug',
                element: <BlogPostPage />,
            },
            {
                path: 'contact',
                element: <ContactPage />,
            },
            {
                path: 'auth/callback',
                element: <AuthCallbackPage />,
            },
            {
                path: 'admin',
                element: <AdminDashboard />,
            },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}

export default router;
