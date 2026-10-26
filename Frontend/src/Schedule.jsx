import Slot from './Slot' 
import {useState, useEffect} from 'react' 
import './styles/Schedule.css'


export default function Schedule() {

    //Function used to return an object with required properties of each slot.
    /**
     * 
     * @param {integer} scheduleClassID - ClassID from database
     * @param {String} teacherName 
     * @param {String} className 
     * @param {integer} startTime - Index of slot at start time
     * @param {integer} endTime - Index of slot at end time
     * @param {integer} isStart - 1 for start position, -1 for end position, 2 for position between
     * @param {String} color - Hexadecimal format
     * @returns {Object}
     */

    function createSlot(scheduleClassID, teacherName, className, startTime, endTime, isStart, color) {
        const slotObject = {scheduleClassID, teacherName, className, startTime, endTime, isStart, color};
        console.log(slotObject);
        return slotObject;
    }


    const rows = 7; //days
    const cols = 25; //time columns (10:00 , 22:00)

    //Creation of 2D array. There is 7 days and each one has 25 empty slot objects 
    const timeSlots = new Array(rows).fill().map(() => new Array(cols).fill(createSlot()));

    //State of slots, initially set to timeSlots array
    const [slots, setSlots] = useState(timeSlots);

    //Current room is initially set to 1 by default
    const [currentRoom, setCurrentRoom] = useState(1);
     
    //Creation of Slot DOM elements, using nested iteration.
    const slotRows = slots.map((slotRow, rowIndex) => {
        const slotRowData = slotRow.map((slot, slotIndex) => {
            return <Slot onUpdate={() => onUpdateSchedule()} key={`${rowIndex}` + `${slotIndex}`} content={slot} row={rowIndex} />
        })
        return <div key={rowIndex} className="slotRow">{slotRowData}</div>
    })

    //
    function placeSlot(day, startTime, endTime, scheduleClassID, firstName, lastName, className, color) {
        // Updating slots state
        setSlots((prevSlots) => {
            // Array of slots including class being placed
            const updatedSlots = prevSlots.map((slotRow, rowIndex) => {
                if(rowIndex === day) { // Checking if current row corresponds to the day the class runs on
                    return slotRow.map((timeSlot, slotIndex) => {
                        const teacherName = firstName + " " + lastName

                        // Creating slot object in slot row, whether its at the start, middle or end of the class
                        if (slotIndex === startTime) {
                            return createSlot(scheduleClassID, teacherName, className, startTime, endTime, 1, color)      
                        }else if(slotIndex === endTime - 1) {
                            return createSlot(scheduleClassID, teacherName, className, startTime, endTime, -1, color)
                        }else if (slotIndex > startTime && slotIndex < endTime - 1) {
                            return createSlot(scheduleClassID, teacherName, className, startTime, endTime, 2, color)
                        }
                        return timeSlot;
                    })
                }
                return slotRow // If row unchanged return previous row
            })
            // Value of state returned is the array with the newly altered slot objects
            return updatedSlots
        })
    }

    //useEffect hook synchronizes component with external system (Backend)
    // Runs on initial render as well as any time currentRoom state variable changes (see dependency array [currentRoom]).
    useEffect(()=> {
        // Function fetches the schedule data to display it
        async function getSchedule() {
            try {
                const res = await fetch('http://localhost:8081/ScheduleData') // HTTP request sent to backend
                const data = await res.json() // Represent response into object format

                data.forEach(currSlot => {
                    if(currSlot.room == currentRoom) { // Filter classes by room
                        //Add class to the DOM with its properties
                        placeSlot(currSlot.day, 
                            currSlot.startTime, 
                            currSlot.endTime, 
                            currSlot.scheduleClassID, 
                            currSlot.firstName, 
                            currSlot.lastName, 
                            currSlot.name, 
                            currSlot.color)
                    }
                })
            } catch (error) {
                console.error("Error fetching Schedule Data : ", error) // Error Handling
            }
        }

        getSchedule();
    }, [currentRoom])

    // Asynchronous function retrieves schedule once more in order for updated slots to be displayed
    async function onUpdateSchedule() {
        try {
            console.log("im trying to fetch data")
            const res = await fetch('http://localhost:8081/ScheduleData')
            const data = await res.json()

            setSlots((prevSlots) => {
                const updatedSlots = prevSlots.map((slotRow, rowIndex) => {
                    const updatedSlotRow = slotRow.map(() => createSlot());

                    data.forEach(currSlot => {
                        if (currSlot.room == currentRoom && currSlot.day === rowIndex) {
                            const teacherName = currSlot.firstName + " " + currSlot.lastName;
                            for (let i = currSlot.startTime; i < currSlot.endTime; i++) {
                                let isStart = 0;
                                if (i === currSlot.startTime) {
                                    isStart = 1;
                                } else if (i === currSlot.endTime - 1) {
                                    isStart = -1;
                                } else {
                                    isStart = 2;
                                }
                                updatedSlotRow[i] = createSlot(
                                    currSlot.scheduleClassID,
                                    teacherName,
                                    currSlot.name,
                                    currSlot.startTime,
                                    currSlot.endTime,
                                    isStart,
                                    currSlot.color
                                );
                            }
                        }
                    });
                    return updatedSlotRow;
                });
                return updatedSlots;
        })} catch (error) {
            console.error("Error fetching Schedule Data : ", error)
        }
    }

    function changeRoom(roomNumber) {
        setSlots(timeSlots) // Reset Schedule
        setCurrentRoom(roomNumber) // Room state variable changes => causes timeSlots to be refilled
    }

    return (
        <>  
            {/* Room is selected via drop down. Room is changed when an option is selected */}
            <select value={currentRoom} onChange={(e) => changeRoom(e.target.value)} className="room-select">
                <option value={1}>Room 1</option>
                <option value={2}>Room 2</option>
                <option value={3}>Room 3</option>
            </select>
            <div className='schedule'>
                <div className='item'></div>
                <div className='days-wrapper item'>
                    <div className='days'>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                        <div>Sun</div>
                    </div>
                </div>
                <div className='times-wrapper item'>
                    <div className='times'>
                        <div>10:00</div>
                        <div>10:30</div>
                        <div>11:00</div>
                        <div>11:30</div>
                        <div>12:00</div>
                        <div>12:30</div>
                        <div>13:00</div>
                        <div>13:30</div>
                        <div>14:00</div>
                        <div>14:30</div>
                        <div>15:00</div>
                        <div>15:30</div>
                        <div>16:00</div>
                        <div>16:30</div>
                        <div>17:00</div>
                        <div>17:30</div>
                        <div>18:00</div>
                        <div>18:30</div>
                        <div>19:00</div>
                        <div>19:30</div>
                        <div>20:00</div>
                        <div>20:30</div>
                        <div>21:00</div>
                        <div>21:30</div>
                        <div>22:00</div>
                    </div>
                </div>
                <div className='grid-wrapper item'>
                    <div className='grid'>
                        {slotRows}
                    </div>
                </div>
            </div> 


        </>

        
    )
}

