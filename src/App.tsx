import { Route, Routes } from "react-router-dom";
import Install from "./pages/Install";
import Home from "./pages/Home";
import Error from "./pages/404";
import Layout from "./pages/Layout";

function App() {
  if (window.ethereum) {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* 404 ERROR */}
          <Route path="/*" element={<Error />} />
        </Route>
      </Routes>
    );
  } else {
    return <Install />;
  }
}

export default App;
