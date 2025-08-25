import { createBrowserRouter } from 'react-router';
import AdminLayout from '../layouts/AdminLayout';
import HomeLayout from '../layouts/HomeLayout';
import UserLayout from '../layouts/UserLayout';
import Payment from '../pages/Payment';
import Login from '../pages/SignIn';
import SignUp from '../pages/SignUp';

const router = createBrowserRouter([
  // for all user & if the role is user

  {
    path: '/',
    element: <HomeLayout />,
    children: [
      {
        path: 'signup',
        element: <SignUp />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },

  {
    path: '/payment',
    element: <Payment />,
  },

  // for logged in user
  {
    path: '/profile',
    element: <UserLayout />,
  },

  // only for logged in admin user

  {
    path: '/dashboard',
    element: <AdminLayout />,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);

export default router;
