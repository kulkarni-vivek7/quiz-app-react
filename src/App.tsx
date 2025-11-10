import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./loginAndRegisterView/Login";
import Register from "./loginAndRegisterView/Register";
import HrRoutes from "./routes/HrRoutes";
import QuizApp from "./candidate-quiz/components/QuizApp";

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hr/*" element={<HrRoutes />} />
          <Route path="/quiz" element={<QuizApp />} />
        </Routes>
      </Router>
    </>
  )
}

export default App