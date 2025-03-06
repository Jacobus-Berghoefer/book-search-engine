import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../graphql/mutations';

interface SignupFormProps {
  handleModalClose: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ handleModalClose }) => {
  const [formState, setFormState] = useState({ username: '', email: '', password: '' });

  const [addUser, { error }] = useMutation(ADD_USER);

  // ✅ This function is now properly used in all input fields
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { data } = await addUser({
        variables: {
          username: formState.username,
          email: formState.email,
          password: formState.password,
        },
      });      

      if (data?.addUser.token) {
        localStorage.setItem('token', data.addUser.token);
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
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formState.username}
          onChange={handleChange} 
          required
        />

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

        <button type="submit">Sign Up</button>
        {error && <p>Error signing up. Please try again.</p>}
      </form>
    </>
  );
};

export default SignupForm;
