import {useState, useEffect} from 'react'
import './styles/App.css'
import Title from './Title'
import Schedule from './Schedule'
import AddStudentModal from './AddStudentModal'
import AddTeacherModal from './AddTeacherModal'
import AddClassModal from './AddClassModal'

//Entry point to application, renders application layout 
//Renders layout including: title, components for "Add" modals and schedule table
function App() {

  return (
    <div className='app'>
      <nav>
        <Title />
        <AddStudentModal /> 
        <AddTeacherModal />
        <AddClassModal />
      </nav>
      <Schedule /> 
    </div>
  )
}

export default App
