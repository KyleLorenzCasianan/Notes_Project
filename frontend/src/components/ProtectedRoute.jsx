import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><span className="loading loading-spinner loading-lg" /></div>;
    }

    return user ? <Outlet /> : <Navigate replace state={{ from: location.pathname }} to="/login" />;
};

export default ProtectedRoute;
