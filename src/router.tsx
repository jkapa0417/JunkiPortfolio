import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import { LoadingSpinner } from './components/ui/Loading';

const HomePage = lazy(() => import('./pages/HomePage'));
const CareerPage = lazy(() => import('./pages/CareerPage'));
const SkillsPage = lazy(() => import('./pages/SkillsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const BlogEditorPage = lazy(() => import('./pages/BlogEditorPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const Loading = () => (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
    </div>
);

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loading />}>
                        <HomePage />
                    </Suspense>
                ),
            },
            {
                path: 'career',
                element: (
                    <Suspense fallback={<Loading />}>
                        <CareerPage />
                    </Suspense>
                ),
            },
            {
                path: 'skills',
                element: (
                    <Suspense fallback={<Loading />}>
                        <SkillsPage />
                    </Suspense>
                ),
            },
            {
                path: 'projects',
                element: (
                    <Suspense fallback={<Loading />}>
                        <ProjectsPage />
                    </Suspense>
                ),
            },
            {
                path: 'blog',
                element: (
                    <Suspense fallback={<Loading />}>
                        <BlogPage />
                    </Suspense>
                ),
            },
            {
                path: 'blog/new',
                element: (
                    <Suspense fallback={<Loading />}>
                        <BlogEditorPage />
                    </Suspense>
                ),
            },
            {
                path: 'blog/edit/:slug',
                element: (
                    <Suspense fallback={<Loading />}>
                        <BlogEditorPage />
                    </Suspense>
                ),
            },
            {
                path: 'blog/:slug',
                element: (
                    <Suspense fallback={<Loading />}>
                        <BlogPostPage />
                    </Suspense>
                ),
            },
            {
                path: 'contact',
                element: (
                    <Suspense fallback={<Loading />}>
                        <ContactPage />
                    </Suspense>
                ),
            },
            {
                path: 'auth/callback',
                element: (
                    <Suspense fallback={<Loading />}>
                        <AuthCallbackPage />
                    </Suspense>
                ),
            },
            {
                path: 'admin',
                element: (
                    <Suspense fallback={<Loading />}>
                        <AdminDashboard />
                    </Suspense>
                ),
            },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}

export default router;
