import {useEffect, useState} from 'react'
import EditStudentsModal from './EditStudentsModal'
import './styles/ClassInfo.css'


export default function ClassInfoModalContent(props) {

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const times = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]

    const content = props.classInfo

    // State variable for class data. An object of two arrays
    const [classData, setClassData] = useState({
        scheduleEntries: [],
        students: []
    })
    
    //reruns whenever classID changes, see dependency array ([content.scheduleClassID])
    useEffect (() => {
        // Data from database is retrieved regarding the class
        async function getClassData() {
            const res = await fetch(`http://localhost:8081/getClassInfo/${content.scheduleClassID}`) //HTTP request sent
            const data = await res.json() // Formatting of JSON data

            // Data is in form {[], []}
            setClassData(data)
        }
        getClassData()
    }, [content.scheduleClassID])

    const updateClassData = async () => {
        const res = await fetch(`http://localhost:8081/getClassInfo/${content.scheduleClassID}`);
        const data = await res.json();
        setClassData(data);
    };

    useEffect(() => {
        // This will log the updated classData once it has been set
        console.log("Updated classData:", classData);
      }, [classData]);

    const scheduleDays = classData.scheduleEntries.map((entry, index) => {
        return <div className='day-entry' key={index}>{days[entry.day]}</div>
    })
    const scheduleStartTimes = classData.scheduleEntries.map((entry, index) => {
        return <div className='day-entry' key={index}>{times[entry.startTime]}</div>
    })
    const scheduleEndTimes = classData.scheduleEntries.map((entry, index) => {
        return <div className='day-entry' key={index}>{times[entry.endTime]}</div>
    })

    const studentFirstNames = classData.students.map((entry, index) => {
        return <div className='student-entry' key={index}>{entry.firstName}</div>
    })
    const studentLastNames = classData.students.map((entry, index) => {
        return <div className='student-entry middle-entry' key={index}>{entry.lastName}</div>
    })
    const studentEmails = classData.students.map((entry, index) => {
        return <div className='student-entry' key={index}>{entry.email}</div>
    })

    // Asynchronous operation, changes made to DOM, only after class is deleted from DB
    async function deleteClass() {
        //HTTP request sent with path parameter.
        //Method is specified
        //Header specifies what data it expects from the server response
        const res = await fetch(`http://localhost:8081/deleteClass/${content.scheduleClassID}`, {
            method: "DELETE",
            headers: {'Content-Type': 'application/json',},
        })
        const data = await res.json() 
        if (res.ok) {
            console.log("Class Was Deleted")// Test through Confirmation
            props.onClose()//Modal closes
            await props.onUpdate() //Reference to prop initially passed down from Schedule.jsx
        }else {
            alert('Failed to delete class.'); //Error handling
        } 
    }

    return (
    <div className="modalContainer">
        <div style={{borderStyle: 'solid', borderWidth: '1px', borderColor: 'black'}}className="modalContentWrapper">
            <div className="modal-content">
                <div>
                    <div className="modal-header">
                    <div className='modal-title'>{content.className}</div>
                    <div className='modal-icon' style={{backgroundColor: content.color}}></div>
                    </div>
                    <div className='class-teacher'>Taught By: {content.teacherName}</div>
                </div>
                <div>
                    <div className='class-schedule'>
                        <div className='times-title'>Times</div>
                        <div className='times-container'>
                            <div className='times-sub'>
                                <div>Days</div>
                                {scheduleDays}
                            </div>
                            <div className='times-sub'>
                                <div>Start Time</div>
                                {scheduleStartTimes}
                            </div>
                            <div className='times-sub'>
                                <div>End Time</div>
                                {scheduleEndTimes}
                            </div>
                        </div>
                    </div>
                    <div className='class-students'>
                        <div className='students-title'>Students</div>
                        <div className='students-container'>
                            <div className='students-sub'>
                                <div className="sub-label">First Name</div>
                                {studentFirstNames}
                            </div>
                            <div className='students-sub middle-sub'>
                                <div className="sub-label middle-entry">Last Name</div>
                                {studentLastNames}
                            </div>
                            <div className='students-sub'>
                                <div className="sub-label">Email</div>
                                {studentEmails}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {/*Button pressed to delete class */}
                    <button className='delete-class-btn' onClick={() => deleteClass()}>Delete Class</button>
                    <EditStudentsModal onStudentsUpdated={updateClassData} class={content.scheduleClassID} students={classData.students}/>
                </div>
            </div>
            <button className="close-btn" onClick={props.onClose}>×</button> 
        </div>
    </div>
    )
}