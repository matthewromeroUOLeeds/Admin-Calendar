import "./styles/Modal.css"
import {useState} from 'react'
import {createPortal} from 'react-dom'
import AddStudentModalContent from './AddStudentModalContent'

export default function AddStudentModal() {

    //Whether Modal is showing defined using state variable.
    //true => showing
    //false => not showing
    const [showModal, setShowModal] = useState(false)


    return (
    <>
        {/*When button is clicked, modal opens*/}
        <button onClick={()=>setShowModal(true)}>
            New Student
        </button>
        {//createPortal is used. Renders modal outside of the main DOM hierarchy
        showModal && createPortal(<AddStudentModalContent onClose={() => setShowModal(false)} />, document.body
        )}
    </>
    ) 
}