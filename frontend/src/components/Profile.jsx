// src/components/Profile.jsx
import { useGetMeQuery } from '../services/authApi';
import { useGetMyPaymentsQuery } from '../services/paymentApi';
import PaymentView from './PaymentView';

export default function Profile() {
  const { data, isLoading, isError, error } = useGetMeQuery();
  const { data: paymentsData } = useGetMyPaymentsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const { fullName, email, image, bio, location, roles } =
    data?.response?.data || {};

  const payments = paymentsData?.response?.data || [];

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="flex items-start gap-6">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img
                src={
                  image ||
                  'https://img.daisyui.com/images/profile/demo/2@94.webp'
                }
                alt="Profile"
              />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold">Name: {fullName}</p>
            <p className="text-gray-600">Email: {email}</p>
            <p className="mt-2">Bio: {bio || 'No bio provided'}</p>
            <p>Location: {location || 'Not specified'}</p>
            <p>Roles: {roles?.join(', ') || 'No roles assigned'}</p>
          </div>
        </div>
        <div>
          {/* Redirect to Home page */}
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = '/')}
          >
            Go to Home
          </button>
          {/* Redirect to payment page */}
          <button
            className="btn btn-secondary"
            onClick={() => (window.location.href = '/payment')}
          >
            Go to Payments
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">My Payments</h3>
        {payments.length > 0 ? (
          <PaymentView payments={payments} />
        ) : (
          <p className="text-gray-500">No payments found.</p>
        )}
      </div>
    </div>
  );
}
