import { Route, Routes } from 'react-router-dom'
import ViewAllCandidates from '../hr-view/pages/ViewAllCandidates'
import ViewAllAnswerSets from '../hr-view/pages/ViewAllAnswerSets'
import Navbar from '../hr-view/components/Navbar'
import ViewAllQuestions from '../hr-view/pages/ViewAllQuestions'

const HrRoutes = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<ViewAllQuestions />} />
        <Route path='/candidates' element={<ViewAllCandidates />} />
        <Route path='/answerSets' element={<ViewAllAnswerSets />} />
      </Routes>
    </div>
  )
}

export default HrRoutes
