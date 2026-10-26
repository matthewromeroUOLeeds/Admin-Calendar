import "./styles/ClassModal.css"
import {useState} from 'react'
import {createPortal} from 'react-dom'
import AddClassModalContent from './AddClassModalContent'

export default function AddClassModal() {

    const [showModal, setShowModal] = useState(false)


    return (
    <>
        <button onClick={()=>setShowModal(true)}>
            New Class
        </button>
        {showModal && createPortal(<AddClassModalContent onClose={() => setShowModal(false)} />, document.body
        )}
    </>
    ) 
}