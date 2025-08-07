import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { setCredentials } from '../redux/features/authSlice';
import { useLoginMutation } from '../services/authApi';

export default function Login() {
  const [login] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await login(data).unwrap();
      console.log('Login successful:', result);
      dispatch(setCredentials(result));
      navigate('/');
    } catch (err) {
      alert(err);
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
