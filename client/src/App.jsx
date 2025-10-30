import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import PeoplePage from './pages/PeoplePage';
import ChoresPage from './pages/ChoresPage';
import PrizesPage from './pages/PrizesPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/chores" element={<ChoresPage />} />
          <Route path="/prizes" element={<PrizesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
