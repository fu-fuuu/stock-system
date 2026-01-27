import { HashRouter, Routes, Route } from "react-router-dom";
import StockSystem from "./StockSystem";
import StatusPage from "./StatusPage";
import "./style.css";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<StockSystem />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
