import {useState, useEffect} from 'react'

const initialSchedule = [
    {id: 0, dayName: 'Mon', startTime: -1, endTime: 100}, 
    {id: 1, dayName: 'Tue', startTime: -1, endTime: 100},
    {id: 2, dayName: 'Wed', startTime: -1, endTime: 100},
    {id: 3, dayName: 'Thu', startTime: -1, endTime: 100},
    {id: 4, dayName: 'Fri', startTime: -1, endTime: 100},
    {id: 5, dayName: 'Sat', startTime: -1, endTime: 100},
    {id: 6, dayName: 'Sun', startTime: -1, endTime: 100}

]


export default function AddClassModalContent({onClose}) {

    const [teacherOptions, setTeacherOptions] = useState([])

    useEffect(() => {
        async function getTeachers() {
            try {
                const res = await fetch('http://localhost:8081/getTeachers');//HTTP request
                const data = await res.json();
                
                console.log(data)
                //response used to create objects with teacher ID and their full name.
                const teachers = data.map((teacher) => (
                    {
                        teacherID: teacher.teacherID,
                        teacherName:  `${teacher.firstName} ${teacher.lastName}`,
                    }
                ))
                console.log(teachers)
                //Option elements created
                setTeacherOptions(
                    teachers.map((teacher, index) => (
                        <option key={index} value={teacher.teacherID}>
                            {teacher.teacherName}
                        </option>
                    ))
                )
            
            }catch (error){
                console.log("Error fetching Teachers Data: " + error) //Error handling
            }
        }

        getTeachers();
    }, [])

    const times = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]

    const [formData, setFormData] = useState({
        name: "",
        teacher: "",
        //Default room is set to 1
        room: 1,
        //Hexadecimal format
        color: "",
        //Schedule array. Composed of 2d array, with each day having object:
        // {id, dayName, startTime, endTime}
        schedule: initialSchedule
    });

    function handleChange(event) {
        setFormData((prevFormData) => ({
                ...prevFormData,
                [event.target.name]: event.target.value
        }))
    }

    const timeOptions = times.map((time, index) => (
        <option key={index} value={index}>
            {time}
        </option>
    ))

    const daySelections = formData.schedule.map((day, index) => (
        <div className='day' key={index}>
            <div>{day.dayName}</div>
            <select className="start-time"  onChange={(e) => updateStartTime(e.target.value, index)}>
                <option value="-1">Start</option>
                {timeOptions}
            </select>

            <select className="end-time" onChange={(e) => updateEndTime(e.target.value, index)}>
                <option value="100">End</option>
                {timeOptions}
            </select>
        </div>
    ))


    function updateStartTime(value, index) {
        setFormData(prevFormData => {
            const newStartTime = parseInt(value, 10);
            const newSchedule = [...prevFormData.schedule];

            newSchedule[index] = { ...newSchedule[index], startTime: newStartTime };

            if (newStartTime >= newSchedule[index].endTime && newSchedule[index].endTime !== 100) {
                alert(`Warning: Start time (${newStartTime}) should be less than end time (${newSchedule[index].endTime})`);
            }

            return { ...prevFormData, schedule: newSchedule };
        })
    }

    function updateEndTime(value, index) { 
        setFormData((prevFormData) => {
            const newEndTime = parseInt(value, 10);
            const newSchedule = [...prevFormData.schedule];
            
            newSchedule[index] = { ...newSchedule[index], endTime: newEndTime };
            
            if (newEndTime <= newSchedule[index].startTime && newSchedule[index].startTime !== -1) {
                alert(`Warning: End time (${newEndTime}) should be greater than start time (${newSchedule[index].startTime})`);
            }
            
            return { ...prevFormData, schedule: newSchedule };
        });
    }


    function formIsValid() {
        let isValid = true;
        let emptyCount = 0;
        //Default values are -1 and 100
        //Ensuring that the schedule entered by the user has non-default values
        formData.schedule.forEach((day) => {
            if(day.startTime === -1 && day.endTime === 100) {
                emptyCount++;
            }else if (day.startTime !== -1 && day.endTime === 100) {
                alert("The End Time for " + day.dayName + " is missing")
                isValid = false;
                return 0
            }else if (day.startTime === -1 && day.endTime !== 100) {
                alert("The Start Time for " + day.dayName + " is missing")
                isValid = false;
                return 0
            }
        })
        // Checking to see if no there was no schedule input
        if (emptyCount === 7){
            alert("You must have at least one slot entry.") //Error msg
            isValid = false;
        }

        return isValid;
    }


    async function checkSpace() {
        //HTTP request returns all schedule records that are located in room chosen by user
        const res = await fetch(`http://localhost:8081/getSchedule/${formData.room}`)
        const data = await res.json()
        //Array of days where class is scheduled with valid start and end times
        const newClassDays = formData.schedule.filter((day) => day.endTime < 100 && day.startTime > -1)
        
        //Iterate through days where class is taken
        for (const newClassDay of newClassDays) {
            //For each day iterate through existing classes on that day
            for (const prevDay of data) {
                if (newClassDay.id === prevDay.day) {
                    const newStart = newClassDay.startTime;
                    const newEnd = newClassDay.endTime;
                    const prevStart = prevDay.startTime;
                    const prevEnd = prevDay.endTime;
                    //Conditions to check whether class overlaps with any existing one
                    if ((newStart >= prevStart && newStart < prevEnd) ||
                        (newEnd > prevStart && newEnd <= prevEnd) ||
                        (newStart <= prevStart && newEnd >= prevEnd)){
                            //error message
                            alert(`Time Conflict on ${newClassDay.dayName} from ${prevStart} to ${prevEnd}`)
                            return false; //Conflict is found
                            
                    }
                }
            }
        }
        
        return true //no conflicts found
    }

    async function addClassToDB(event) {
        event.preventDefault();
        //checkSpace() returns true if class schedule does not overlap with any pre-existing classes
        const isAvailable = await checkSpace()
        //Validation for adding class
        if (formIsValid() && isAvailable) {
            try {
                const res = await fetch(`http://localhost:8081/postClass`, { //POST HTTP request
                    method: "POST",
                    //Form data is being sent as request, so body and headers match this accordingly
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(formData)
            
                })
                if (res.ok) {
                    //After operation state variables are reset
                    setFormData({name: "", teacher: "", room: 1, schedule: initialSchedule})
                    setTeacherOptions([])
                    //Modal is closed and page is reloaded, will cause schedule to be re-rendered
                    onClose()
                    window.location.reload();
                    //Test to see if action successful
                    alert("Class Has been Successfully Added")
                }else {
                    alert('Error In Adding Class');//error handling
                }       
            } catch (err) {
                console.error('Error:' + err) //error handling
            }
        }else {
            //Form is incomplete, or there are errors in its input
            console.log("Schedule is not ready yet.")
        }


    }


    return (
    <div className="modalContainer">
        <div className="modalContentWrapper">
            <form className="classModalForm" onSubmit={addClassToDB}>

                <div className="modal-title">New Class</div>
                <div>
                    <label>Class Name</label>
                    <input value={formData.name} name="name" onChange={handleChange} required={true}/>
                </div>
                <div className='teacher-select'>
                    <label>Teacher</label>
                    <select value={formData.teacher} name="teacher" onChange={handleChange} required={true}>
                        <option value="">~</option>
                        {teacherOptions}
                    </select>
                </div>
                <div className='room-select'>
                    <label>Room</label>
                    <select value={formData.room} name="room" onChange={handleChange} required={true}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                    </select>
                </div>

                <div className="day-options">
                    {daySelections}
                </div>

                <div>
                    <label>Colour</label>
                    <input type="color" name="color" onChange={handleChange} required={true}/>
                </div>

                <button type="submit">Create</button>
            </form>
            <button className="close-btn" onClick={onClose}>×</button> 
        </div>
    </div>
    )
}