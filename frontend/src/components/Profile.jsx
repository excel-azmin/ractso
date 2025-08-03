// src/components/Profile.jsx
import { useGetMeQuery } from '../services/authApi';

export default function Profile() {
  const { data, isLoading, isError, error } = useGetMeQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const { fullName, email, image, bio, location, roles } =
    data?.response?.data || {};

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {fullName}</p>
      <p>Email: {email}</p>
      <p>Bio: {bio}</p>
      <p>Location: {location}</p>
      <p>Roles: {roles?.join(', ')}</p>
    </div>
  );
}
