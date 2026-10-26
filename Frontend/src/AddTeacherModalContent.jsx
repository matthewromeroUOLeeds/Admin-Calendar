import {useState} from 'react'


export default function AddTeacherModalContent({onClose}) {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "", 
        email: ""
    });

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: ""
    });


    function handleChange(event) {
        setFormData((prevFormData) => ({
                ...prevFormData,
                [event.target.name]: event.target.value
        }))
        
    }

    function isFormValid() {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (emailPattern.test(formData.email)) {
            console.log("Valid Email")
            return true
        }else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: 'Invalid Email Addresss'
            }))
            return false 
        }
    }


    async function addTeacherToDB(event) {
        event.preventDefault()

        if (isFormValid()) {
            try {
                const res = await fetch(`http://localhost:8081/postTeacher`, {
                    method: "POST",
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(formData)
            
                })
                if (res.ok) {
                    console.log(formData)
                    setFormData({ firstName: '', lastName: '', email: '' });
                    setErrors({ firstName: '', lastName: '', email: '' })
                    onClose()
                    const data = res
                    console.log(data)
                    alert('Teacher added successfully!');
                }else {
                    alert('Failed to add Teacher.');
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
            <form className="modalForm" onSubmit={addTeacherToDB}>
                <div className="modal-title">Add Teacher</div>
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
                {errors.email && <p className="error">{errors.email}</p>}
                <button type="submit">Create</button>
            </form>
            <button className="close-btn" onClick={onClose}>×</button> 
        </div>
    </div>
    )
}