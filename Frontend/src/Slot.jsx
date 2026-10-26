import './styles/Slot.css'
import {useState} from 'react'
import {createPortal} from 'react-dom'
import ClassInfoModalContent from './ClassInfoModalContent'

export default function Slot(props) {
    // Slot content is passed down as a prop from the components creation in Schedule.jsx
    const slotData = props.content

    const [showModal, setShowModal] = useState(false)

    function handleClick() {
        setShowModal(true); // Open modal when class slot clicked
    }

    // Provides slot with relevant information corresponding to its position. 
    function checkStart(slotData){
        if(slotData.isStart === 1) {
            return <div onClick={handleClick} 
                        style={{backgroundColor: slotData.color, borderRight: "none"}} 
                        className='slot'>
                    {slotData.className}</div>
        }else if (slotData.isStart === -1) {
            return <div onClick={handleClick} 
                        style={{backgroundColor: slotData.color, borderLeft: "none"}} 
                        className='slot'>
                    Teacher: {slotData.teacherName}</div>
        }else if(slotData.isStart === 2) {
            return <div onClick={handleClick} 
                        style={{backgroundColor: slotData.color, borderLeft: "none", borderRight: "none"}} 
                        className='slot'>
                    </div>
        }else {
            return <div className='slot'>{slotData.className}</div>
        }
    }

    return (
        <>
            {checkStart(slotData)}
            {
            // Props are passed down further into ClassInfoModalContent component
            // props.onUpdate refers to onUpdateSchedule() function in Schedule.jsx
            showModal && createPortal(<ClassInfoModalContent onUpdate={() => props.onUpdate()} 
                                                            classInfo={slotData} 
                                                            onClose={() => setShowModal(false)} />
                                    , document.body)
            }
        </>
    )
}