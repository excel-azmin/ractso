import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';

export default function UserLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        {isAuthenticated ? (
          <div className="p-4 bg-base-200 rounded-box">
            <h1>Welcome, {user?.fullName}!</h1>
            <h4>Email: {user?.email}</h4>
            <p>
              You are now logged in. Explore your account or navigate to your
              profile.
            </p>

            <Link to="/" className="btn btn-primary">
              Home
            </Link>
          </div>
        ) : (
          <div>
            <h1>Please log in to access your account.</h1>
          </div>
        )}
      </div>
    </div>
  );
}
