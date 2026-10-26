import "./styles/Modal.css"
import {useState, useRef} from 'react'
import {createPortal} from 'react-dom'
import EditStudentsModalContent from './EditStudentsModalContent'

export default function EditStudentsModal(props) {

    const [showModal, setShowModal] = useState(false)

    return (
    <>
        <button className="edit-class-btn" onClick={()=>setShowModal(true)}>
            Add/Remove Students
        </button>
        {showModal && createPortal(<EditStudentsModalContent onStudentsUpdated={props.onStudentsUpdated} class={props.class} students={props.students} onClose={() => setShowModal(false)} />, document.body
        )}
    </>
    ) 
}