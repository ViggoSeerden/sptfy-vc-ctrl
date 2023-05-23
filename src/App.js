import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EN from './pages/EN';

function App() {
  return (
    <div className="" id="bg">
      <Router>
        <Routes>
          {/* <Route exact path="/nl" element={<NL />} /> */}
          <Route exact path="/sptfy-vc-ctrl" element={<EN />} />
          {/* <Route exact path="/Test" element={<Test />} /> */}
        </Routes>
        {/* <TabBar></TabBar> */}
      </Router>
    </div>
  );
}

export default App;
