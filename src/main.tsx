import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PostHogProvider } from "posthog-js/react";
const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  // Removed 'defaults' as it is not compatible with PostHogConfig
};



createRoot(document.getElementById("root")!).render(
  <PostHogProvider
    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    options={options}
  >
    <App />
  </PostHogProvider>
);
