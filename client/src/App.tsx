import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This will render child routes from main.tsx */}
    </>
  );
}

export default App;


