import { createBrowserRouter } from 'react-router';
import AdminLayout from '../layouts/AdminLayout';
import HomeLayout from '../layouts/HomeLayout';
import UserLayout from '../layouts/UserLayout';

const router = createBrowserRouter([
  // for all user & if the role is user

  {
    path: '/',
    element: <HomeLayout />,
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
