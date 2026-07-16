import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';

// Configure global Axios baseURL for API calls
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
