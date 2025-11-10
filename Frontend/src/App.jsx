import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
