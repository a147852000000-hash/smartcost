import { useState } from "react";
import { AuthView } from "./components/AuthView";
import { FinanceApp } from "./finance/FinanceApp";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  if (!authenticated) {
    return <AuthView onAuthenticated={() => setAuthenticated(true)} onGuest={() => setAuthenticated(true)} />;
  }
  return <FinanceApp />;
}
