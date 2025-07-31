import { createBrowserRouter } from 'react-router';
import AdminLayout from '../layouts/AdminLayout';
import HomeLayout from '../layouts/HomeLayout';
import UserLayout from '../layouts/UserLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
  },
  {
    path: '/profile',
    element: <UserLayout />,
  },
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
