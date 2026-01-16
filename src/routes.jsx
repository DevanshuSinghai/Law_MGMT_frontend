/**
 * Application routes configuration.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from './stores';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Main pages
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/cases/CasesPage';
import CaseDetailPage from './pages/cases/CaseDetailPage';
import CaseFormPage from './pages/cases/CaseFormPage';
import ClientsPage from './pages/clients/ClientsPage';
import ClientFormPage from './pages/clients/ClientFormPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import TasksPage from './pages/tasks/TasksPage';
import TeamPage from './pages/team/TeamPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <AuthLayout>
                            <LoginPage />
                        </AuthLayout>
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <AuthLayout>
                            <RegisterPage />
                        </AuthLayout>
                    </PublicRoute>
                }
            />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Cases */}
                <Route path="cases" element={<CasesPage />} />
                <Route path="cases/new" element={<CaseFormPage />} />
                <Route path="cases/:id" element={<CaseDetailPage />} />
                <Route path="cases/:id/edit" element={<CaseFormPage />} />

                {/* Clients */}
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/new" element={<ClientFormPage />} />
                <Route path="clients/:id/edit" element={<ClientFormPage />} />

                {/* Documents */}
                <Route path="documents" element={<DocumentsPage />} />

                {/* Tasks */}
                <Route path="tasks" element={<TasksPage />} />

                {/* Team */}
                <Route path="team" element={<TeamPage />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRoutes;
