import Layout from "./Layout";
import { useEffect, useState } from "react";
import "./index.css";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1300); // total loading duration (1200 + 350ms)

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center ">
        <img
          src="logo.svg"
          alt="Loading..."
          className="w-32 h-32 animate-splash"
        />
      </div>
    );
  }

  return <Layout />;
};

export default App;
