import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';

interface LoginFormProps {
  handleModalClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ handleModalClose }) => {
  const [formState, setFormState] = useState({ email: '', password: '' });

  const [loginUser, { error }] = useMutation(LOGIN_USER);

  // ✅ This function is now correctly used in input fields
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { data } = await loginUser({
        variables: { ...formState },
      });

      if (data?.login.token) {
        localStorage.setItem('token', data.login.token);
        handleModalClose(); // ✅ Close modal on success
        window.location.reload(); // ✅ Refresh to apply authentication state
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formState.password}
          onChange={handleChange} 
          required
        />

        <button type="submit">Login</button>
        {error && <p>Error logging in. Please try again.</p>}
      </form>
    </>
  );
};

export default LoginForm;


