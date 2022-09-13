import "./App.css";
import { Navigate, Routes, Route } from "react-router-dom";

import { v4 as GenerateRoomId } from "uuid";

import VideoGrid from "./VideoGrid";

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to={`/${GenerateRoomId()}`} />} />
    <Route path="/:room" element={<VideoGrid />} />
  </Routes>
);

export default App;
