import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from "./App";
import ErrorBoundary from './components/ErrorBoundary';

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Enable React's concurrent features
const root = createRoot(document.getElementById('root')!);

// Wrap the app with ErrorBoundary in development
const renderApp = () => (
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Initial render
root.render(renderApp());

// Enable Webpack Hot Module Replacement in development
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // Try to re-render the app when hot updates are available
    try {
      root.render(renderApp());
    } catch (error) {
      console.error('Error during hot reload:', error);
    }
  });
}
