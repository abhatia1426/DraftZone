import { Routes, Route } from "react-router-dom";
import PlayerSearchPage from "./pages/PlayerSearchPage";
import Home from "./Home";
import Odds from "./Odds";


export default function App() {
  return (
    <Routes>
      <Route path="/player-search" element={<PlayerSearchPage />} />
      <Route path="/" element={<Home />} />
      <Route path="/odds" element={<Odds />} />
    </Routes>
  );
}
