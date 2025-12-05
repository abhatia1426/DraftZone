import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Odds from "./Odds.jsx";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/odds" element={<Odds />} />
    </Routes>
  );
}
