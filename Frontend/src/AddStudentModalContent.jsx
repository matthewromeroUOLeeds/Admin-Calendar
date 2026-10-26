import {useState} from 'react'

export default function AddStudentModalContent({onClose}) {


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "", 
        email: ""
    });

    function handleChange(event) {
        // Re-renders component everytime input value changes
        setFormData((prevFormData) => ({
                ...prevFormData,
                [event.target.name]: event.target.value
        }))
    }

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: ""
    });

    function isFormValid() {
        //regex code for email
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (emailPattern.test(formData.email)) {
            console.log("Valid Email")
            return true
        }else {
            //Errors object in state is modified
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: 'Invalid Email Addresss'
            }))
            return false 
        }
    }

    async function addStudentToDB(event) {
        event.preventDefault()

        //User inputs are validated
        if (isFormValid()) {
            try {
                //HTTP POST request is sent.
                const res = await fetch(`http://localhost:8081/postStudent`, {
                    method: "POST",
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(formData)
            
                })
                if (res.ok) {
                    console.log(formData)
                    //Clear user input state variable objects
                    setFormData({ firstName: '', lastName: '', email: '' });
                    setErrors({ firstName: '', lastName: '', email: '' })
                    //Close Modal
                    onClose()
                    const data = res
                    //Testing response from backend
                    console.log(data)
                    alert('Student added successfully!');
                }else {
                    alert('Failed to add student.');
                }       
            } catch (err) {
                console.error('Error:' + err) 
            }



        }else {
            console.log("Invalid Form Submission")
        }
    }



 
    return (
    <div className="modalContainer">
        <div className="modalContentWrapper">
            <form className="modalForm" onSubmit={addStudentToDB}>
                <div className="modal-title">Add Student</div>
                <div>
                    <label>First Name</label>
                    <input value={formData.firstName} name="firstName" onChange={handleChange} required={true}/>
                    {errors.firstName && <p className="error">{errors.firstName}</p>}
                </div>
                <div>
                    <label>Last Name</label>
                    <input value={formData.lastName} name="lastName" onChange={handleChange} required={true}/>
                    {errors.lastName && <p className="error">{errors.lastName}</p>}
                </div>
                <div>
                    <label>Email</label>
                    <input value={formData.email} name="email" onChange={handleChange} required={true} />
                </div>
                {/*Error in input causes error element to be added to DOM*/}
                {errors.email && <p className="error">{errors.email}</p>}
                <button type="submit">Create</button>
            </form>
            <button className="close-btn" onClick={onClose}>×</button> 
        </div>
    </div>
    )
}