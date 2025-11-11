import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Layout from "./components/Layout";
import History from "./pages/History";
import Analyze from "./pages/Analyze";
import Community from "./pages/Community";
import About from "./pages/About";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="history" element={<History />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="community" element={<Community />} />
          <Route path="about" element={<About />} />
          <Route path="saved" element={<Saved />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
