import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';

import { setContext } from '@apollo/client/link/context';
import { createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  console.log("🟡 Sending Token:", token);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});


// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // ✅ Make sure App.tsx wraps everything
    children: [
      { index: true, element: <SearchBooks /> },
      { path: 'saved', element: <SavedBooks /> },
    ],
    errorElement: <h1 className='display-2'>Wrong page!</h1>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>
);