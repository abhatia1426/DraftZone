import { Routes, Route } from "react-router-dom";
import PlayerSearchPage from "./pages/PlayerSearchPage";

export default function App() {
  return (
    <Routes>
      <Route path="/player-search" element={<PlayerSearchPage />} />
    </Routes>
  );
}
