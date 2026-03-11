import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import WaterBodyDetail from './pages/WaterBodyDetail';
import Locations from './pages/Locations';


function App() {
  return (
    <Router>
      <div id="app-root">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard/:city" element={<Dashboard />} />
            <Route path="/water-body/:id" element={<WaterBodyDetail />} />
            <Route path="/locations" element={<Locations />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
