import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import "./index.css";
import "./i18n";

import { App } from "./App";
import reportWebVitals from "./reportWebVitals";

const queryClient = new QueryClient();

const RootApp = () => {
  const [, i18nInstance] = useTranslation();
  const googleLang =
    i18nInstance.language === "ua" ? "uk" : i18nInstance.language;

  return (
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
      key={`google-auth-${googleLang}`}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
);

reportWebVitals();
