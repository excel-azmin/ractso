import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import HomePage from '../pages/HomePage';
import Login from '../pages/SignIn';
import SignUp from '../pages/SignUp';

function HomeLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div>
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
