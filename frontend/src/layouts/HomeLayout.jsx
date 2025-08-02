import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import HomePage from '../pages/HomePage';
import Login from '../pages/SignIn';
import SignUp from '../pages/SignUp';

function HomeLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  console.log('HomeLayout user:', user);
  console.log('HomeLayout isAuthenticated:', isAuthenticated);

  return (
    <div>
      {user && (
        <div className="welcome-message">
          Welcome, {user.name || user.email}!
        </div>
      )}
      <Navbar />
      {!isAuthenticated && (
        <>
          <SignUp />
          <Login />
        </>
      )}
      {isAuthenticated && <HomePage />}
    </div>
  );
}

export default HomeLayout;
