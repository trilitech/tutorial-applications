import { createRoot } from "react-dom/client";
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";
import App from "./App.tsx";
import "./index.css";

const client = createThirdwebClient({
  clientId: "<THIRDWEB_CLIENTID>",
});

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <App thirdwebClient={client} />
  </ThirdwebProvider>
);
