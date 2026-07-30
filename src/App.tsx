import { Routes, Route } from 'react-router-dom';
import { Instructions } from './pages/Instructions';
import { Exam } from './pages/Exam';
import { Results } from './pages/Results';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Instructions />} />
      <Route path="/exam" element={<Exam />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}

export default App;
