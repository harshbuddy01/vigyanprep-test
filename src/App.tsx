import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { SystemCheck } from './components/SystemCheck';
import { Instructions } from './pages/Instructions';
import Exam from './pages/Exam';
import { Results } from './pages/Results';
import { Feedback } from './pages/Feedback';
import { ResponseSheet } from './pages/ResponseSheet';
import { AdaptiveRevision } from './pages/AdaptiveRevision';
import { AdaptiveTest } from './pages/AdaptiveTest';
import { AdaptiveDiagnosis } from './pages/AdaptiveDiagnosis';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/system-check" element={<SystemCheck />} />
      <Route path="/instructions" element={<Instructions />} />
      <Route path="/exam" element={<Exam />} />
      <Route path="/results" element={<Results />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/response-sheet" element={<ResponseSheet />} />
      <Route path="/adaptive-revision" element={<AdaptiveRevision />} />
      <Route path="/adaptive-test" element={<AdaptiveTest />} />
      <Route path="/adaptive-diagnosis" element={<AdaptiveDiagnosis />} />
    </Routes>
  );
}

export default App;
