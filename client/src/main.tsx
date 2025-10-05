import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections globally to prevent Vite runtime error overlay
window.addEventListener('unhandledrejection', (event) => {
  // Allow AbortError (cancelled requests) to pass through without showing overlay
  if (event.reason?.name === 'AbortError') {
    event.preventDefault();
    console.log('Request cancelled - this is normal during navigation');
    return;
  }
  
  // Handle other network errors gracefully
  if (event.reason?.message?.includes('Network connection failed') || 
      event.reason?.message?.includes('Not authenticated')) {
    event.preventDefault();
    console.warn('Network/auth error handled gracefully:', event.reason);
    return;
  }
  
  // Let other errors bubble up normally
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
