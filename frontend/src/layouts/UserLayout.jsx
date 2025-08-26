import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Profile from '../components/Profile';

export default function UserLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        {isAuthenticated ? (
          <Profile />
        ) : (
          <div>
            <h1>Please log in to access your account.</h1>
          </div>
        )}
      </div>
    </div>
  );
}
