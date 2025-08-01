import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../services/authApi';

export default function Login() {
  const [login] = useLoginMutation();
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const loggedInUser = useSelector((state) => state.auth);

  console.log('Logged in user RTK:', loggedInUser);

  useEffect(() => {
    console.log('Current auth state:', loggedInUser);
    console.log('LocalStorage user:', localStorage.getItem('user'));
    console.log(
      'LocalStorage access_token:',
      localStorage.getItem('access_token'),
    );
  }, [loggedInUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await login(data).unwrap();
      console.log('Login result:', result?.response?.data?.user);
      console.log('Access Token:', result?.response?.data?.access_token);
      console.log('Refresh Token:', result?.response?.data?.refresh_token);
      if (result?.response?.data) {
        dispatch(
          setCredentials({
            user: result.response.data.user,
            access_token: result.response.data.access_token,
            refresh_token: result.response.data.refresh_token,
          }),
        );
      } else {
        console.error('Unexpected API response structure:', result);
        setError('Invalid server response');
      }
    } catch (err) {
      setError(err.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
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
          <button className="btn btn-neutral mt-4">Login</button>
        </fieldset>
      </form>
    </div>
  );
}
