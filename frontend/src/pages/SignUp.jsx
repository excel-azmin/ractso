import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRegisterMutation } from '../services/authApi';

export default function SignUp() {
  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    try {
      await register(data).unwrap();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <label className="label">First Name</label>
            <input
              type="text"
              className="input"
              placeholder="First Name"
              required
              name="firstName"
            />
            <label className="label">Last Name</label>
            <input
              type="text"
              className="input"
              placeholder="Last Name"
              name="lastName"
            />

            <label className="label">Email</label>
            <input
              type="email"
              className="input validator"
              placeholder="Email"
              required
              name="email"
            />
            <label className="label">Password</label>
            <input
              type="password"
              className="input validator"
              placeholder="Password"
              required
              name="password"
            />
            <button className="btn btn-neutral mt-4">Sign Up</button>
          </fieldset>
        </form>
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="login" className="text-blue-500 underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
