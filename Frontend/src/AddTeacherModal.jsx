import './styles/Modal.css'
import {useState} from 'react'
import {createPortal} from 'react-dom'
import AddTeacherModalContent from './AddTeacherModalContent'

export default function AddStudentModal() {

    const [showModal, setShowModal] = useState(false)


    return (
    <>
        <button onClick={()=>setShowModal(true)}>
            New Teacher
        </button>
        {showModal && createPortal(<AddTeacherModalContent onClose={() => setShowModal(false)} />, document.body
        )}
    </>
    ) 
}