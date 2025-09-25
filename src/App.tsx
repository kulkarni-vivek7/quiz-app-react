import QuizApp from "./components/QuizApp";
import RegistrationForm from "./components/RegistrationForm"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<RegistrationForm />} />
          <Route path="/quiz" element={<QuizApp />} />
        </Routes>
      </Router>
    </>
  )
}

export default App