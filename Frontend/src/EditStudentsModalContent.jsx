import {useState, useEffect} from 'react'


export default function EditStudentsModalContent(props) {
    function sortStudents(arr) {
        arr.sort((a,b) => {
            const nameA = a.firstName.toUpperCase() + a.lastName.toUpperCase();
            const nameB = b.firstName.toUpperCase() + b.lastName.toUpperCase();
        
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        })
        return arr
    }

    //Array of students already taking the class.
    const [studentsTakingClass, setStudentsTakingClass] = useState(props.students)
    //Array of student IDs already taking the class.
    const [studentsTakingID, setStudentsTakingID] = useState(studentsTakingClass.map(student => {return student.studentID}))

    //Array containing all students with a property which derermines whether they are taking class (isTaking)
    const [studentsStatus, setStudentsStatus] = useState([])
    //Run on initial render
    useEffect(() => {
        async function getStudents() {
            const res = await fetch('http://localhost:8081/getStudents') //HTTP Request sent
            const data = await res.json()
            // Students sorted alphabetically
            const sortedData = sortStudents(data)

            //studentsStatus is given an array of objects
            setStudentsStatus(sortedData.map(student => {
                return {
                    studentID: student.studentID,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    email: student.email,
                    //isTaking is boolean. True if the current studentId is in the array of ids already taking the class
                    isTaking: studentsTakingID.includes(student.studentID)
                }
            }))
        }

        getStudents()
    }, [])

    useEffect(() => {
        // This will log the updated classData once it has been set
        console.log(studentsStatus);
    }, [studentsStatus]);

    function updateTakingStatus(student) {
        setStudentsStatus(prevStudentsStatus => {
            return (prevStudentsStatus.map(prevStudent => {
                if (prevStudent.studentID === student.studentID) {
                    return {
                        ...student,
                        isTaking: !(student.isTaking)
                    }
                }else {
                    return {...prevStudent}
                }
            }))
        })
    }

    const editStudentEntries = studentsStatus.map((student, index) => {
        return <div key={index} className="edit-student-entry">
            {/*Ternary operator is used
               User clicks checkbox to change whether student is taking class
               Box is checked if isTaking propery is true
               updateTakingStatus changes the value of the isTaking property for that student
            */}
            {student.isTaking ? <div><input type="checkbox" checked={true} onChange={() => updateTakingStatus(student)}/></div> : 
                                <div><input type="checkbox" checked={false} onChange={() => updateTakingStatus(student)}/></div>}
            <div>{student.firstName}</div>
            <div>{student.lastName}</div>
            <div>{student.email}</div>
        </div>
    })

    async function updateClassesTaken() {
        //Once the user makes necessary changes to class, students now taking class are stored
        const currentStudentsTaking = studentsStatus.filter(student => student.isTaking)
        const currentStudentsTakingIDs = currentStudentsTaking.map(student => student.studentID)

        //Array of students that were added
        const studentsToAdd = currentStudentsTakingIDs.filter(studentID => !(studentsTakingID.includes(studentID)))
        //Array of students that were removed
        const studentsToRemove = studentsTakingID.filter(studentID => !(currentStudentsTakingIDs.includes(studentID)))

        //Request body made up of object with three properties.
        //studentsToAdd, studentsToRemove - arrays of studentIDs 
        const requestBody = {studentsToAdd: studentsToAdd, studentsToRemove: studentsToRemove, classID: props.class}

        const res = await fetch('http://localhost:8081/postClassesTaken', {
            //POST action
            method: 'POST',
            //Headers and body specified to accomodate the type of request
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(requestBody)
        })
        if (res.ok) {
            console.log(res.message)//Test for successful action
            props.onClose()//Close Modal
            props.onStudentsUpdated();//Updates classData in classInfoModalContent
        }else {
            console.log("theres been an error")
        }
        
    }
 
    return (
    <div className="modalContainer">
        <div className="modalContentWrapper">
            <div className="modal-content">
                <div className='modal-title'>Student List</div>
                <div style={{display: 'grid', gridAutoRows: '2rem'}} className='modal-allstudents'>
                    <div className='edit-student-entry edit-student-title'>
                        <div>Select</div>
                        <div>First Name</div>
                        <div>Last Name</div>
                        <div>Email</div>
                    </div>
                    {editStudentEntries}
                </div>
                <div className='update-btn-container'><button onClick={() => updateClassesTaken()} className="update-students-btn">Update Student List</button></div>
            </div>
            <button className="close-btn" onClick={props.onClose}>×</button> 
        </div>
    </div>
    )
}