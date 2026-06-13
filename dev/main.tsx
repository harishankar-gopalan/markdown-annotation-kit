import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TestCaseApp from './TestCaseApp';
import './index.css';

// Switch test cases via URL parameters.
// Visit http://localhost:3000?test=true to view the test cases.
const urlParams = new URLSearchParams(window.location.search);
const useTestCase = urlParams.get('test') === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {useTestCase ? <TestCaseApp /> : <App />}
  </React.StrictMode>
);

