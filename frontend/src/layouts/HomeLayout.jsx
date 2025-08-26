import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router';
import Navbar from '../components/Navbar';

function HomeLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  return (
    <div>
      <Navbar />

      {isAuthenticated ? (
        // Show homepage if authenticated
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">
            Welcome, {user?.fullName}!
          </h1>
          <p>
            You are now logged in. Explore your account or navigate to your
            profile.
          </p>
          <div className="mt-6">
            <Link to="/profile" className="btn btn-primary mr-4">
              Go to Profile
            </Link>
            <Link to="/payment" className="btn btn-primary mr-4">
              Go to Payment
            </Link>

            {user.role === 'admin' && (
              <Link to="/dashboard" className="btn btn-secondary">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      ) : (
        // Show auth content if not authenticated
        <div className="container mx-auto p-4">
          <div className="tabs tabs-boxed justify-center mb-8">
            <Link
              to="/login"
              className={`tab tab-lg ${
                location.pathname === '/login' ? 'tab-active' : ''
              }`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={`tab tab-lg ${
                location.pathname === '/signup' ? 'tab-active' : ''
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* This Outlet will render either Login or Signup based on the route */}
          <div className="max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeLayout;
