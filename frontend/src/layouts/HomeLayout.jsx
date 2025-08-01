import Navbar from '../components/Navbar';
import Login from '../pages/SignIn';
import SignUp from '../pages/SignUp';

function HomeLayout() {
  return (
    <div>
      <Navbar />
      <SignUp />
      <Login />
    </div>
  );
}

export default HomeLayout;
