require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { installAuth } = require('./auth');
const createDatabase = require('./database');
const path = require('node:path');
function createApp(db, authOptions) {
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '32kb' }));
// Optional same-origin deployment: build Frontend/dist and serve it with the API.
app.use(express.static(path.join(__dirname, '..', 'Frontend', 'dist')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
installAuth(app, db, authOptions);

app.get('/', (re, res) => {
    return res.json("Hello This is the start of your journey here in the ohm admin panel")
})

app.get('/ScheduleData', (req, res) => {
    console.log("Schedule query") // Message used to verify that http request is recieved by server
    // SQL query fetches all schedule data, including the details of each class and the details of its teacher
    const sql = `SELECT Schedule.* , Classes.*, Teachers.*
                 FROM Schedule
                 INNER JOIN Classes ON Schedule.scheduleClassID = Classes.classID
                 INNER JOIN Teachers ON Classes.teacherID = Teachers.teacherID
                `
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err); //Handle db error with suitable error code
        return res.json(data); //Send data to frontend
    })
})

app.get('/getSchedule/:room', (req, res) => {
    console.log("Schedule query")
    const {room} = req.params
    const sql = `SELECT Schedule.* 
                 FROM Schedule
                 WHERE Schedule.room = ?
                `
    db.query(sql, [room], (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/getTeachers', (req, res) => {
    console.log("Teacher query")
    const sql = `SELECT *
                 FROM Teachers
                `
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

//Path paremeter used in url
app.get('/getClassInfo/:classID',(req, res) => {
    console.log('Class Info GET...')
    //enabling classID to be accessed from the path parameter
    const {classID} = req.params
    // Query used to retrieve all Schedule entries corresponding to classID
    const scheduleQuery = `
            SELECT Schedule.*
            FROM Schedule
            WHERE Schedule.scheduleClassID = ?;
        `;
    //Query used to retrive all students which take the class
    const studentQuery = `
            SELECT Students.*
            FROM Students
            JOIN ClassesTaken ON Students.studentID = ClassesTaken.takenStudentID
            WHERE ClassesTaken.takenClassID = ?
        `
    //First, schedule query is ran
    db.query(scheduleQuery, [classID], (err1, scheduleResult) => {
        if (err1) return res.status(500).json({ error: 'Schedule query failed'});
        //Nested query. Then, student query is ran
        db.query(studentQuery, [classID], (err2, studentResult)=> {
            if (err2) return res.status(500).json({error: 'Student query failed'});
            //Response contains an object of two arrays. Each with the result of their query
            res.json({
                scheduleEntries: scheduleResult,
                students: studentResult
            });
        })
    });
})

app.get('/getStudents', (req, res) => {
    console.log('Student get...')

    const sql = `SELECT Students.*
                 FROM Students            
    `

    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    })
})

//Path url parameter used
app.delete('/deleteClass/:classID', (req, res) => {
    console.log("Delete Class...")
    const {classID} = req.params

    const deleteQuery = `
    DELETE
    FROM Classes
    WHERE Classes.classID = ?;
    `;
    //Parameterized query parameter
    db.query(deleteQuery, [classID], (err, result)=> {
        if(err) return res.status(500).json(err); //suitable error handling
        return res.json(result);
    })
})

app.post('/postStudent', (req, res) => {
    console.log("Student post...")

    //  SQL query - Alters Students table
    const sql = "INSERT INTO Students (firstName, lastName, email) VALUES (?,?,?)"

    //SQL query takes parameters from the body of the HTTP request which are in the form of JSON.
    db.query(sql, [req.body.firstName, req.body.lastName, req.body.email], (err, result) => {
        //Tests whether record is inserted
        if (err) return res.status(500).json(err);
        console.log("1 Student record inserted");
        console.log(result)
        return res.json(result)

    })
                                                                                      
})

app.post('/postTeacher', (req, res) => {
    console.log("Teachers post...")

    const sql = "INSERT INTO Teachers (firstName, lastName, email) VALUES (?,?,?)"
    db.query(sql, [req.body.firstName, req.body.lastName, req.body.email], (err, result) => {
        if(err) return res.json(err);
        console.log("1 Teacher Record inserted")
        console.log(result)
        return res.json(result);
    })
})


app.post('/postClass', (req, res) => {
    console.log("Class Post...");
    //Properties for Class record are placed into object for insertion into DB
    const classContent = {
        name: req.body.name,
        teacherID: req.body.teacher,
        color: req.body.color
    };

    const classSQL = "INSERT INTO Classes (name, teacherID, color) VALUES (?,?,?)";
    //Nested query. First Class record is inserted.
    db.query(classSQL, [classContent.name, classContent.teacherID, classContent.color], (err, result) => {
        if (err) return res.status(500).json(err); //Return error with appropriate status code
        console.log("1 Class Record inserted");
        const classInsertID = result.insertId; // Now classInsertID is correctly set
    // Filtering schedule array, only including the times where a slot will be filled
        const scheduleTimeInfo = req.body.schedule.filter((day) => day.startTime >= 0); 

        //Parameterized query
        const scheduleSQL = "INSERT INTO Schedule (scheduleClassID, day, startTime, endTime, room) VALUES (?,?,?,?,?)";

        //Array of promises. Each one involves the insertion of schedule record.
        //Used since there can be multiple schedule slots referring to class
        const schedulePromises = scheduleTimeInfo.map(activeSlot => {
          return new Promise((resolve, reject) => {
            db.query(scheduleSQL, [classInsertID, activeSlot.id, activeSlot.startTime, activeSlot.endTime, req.body.room], (err, result) => {
              if (err) reject(err);
              else {
                console.log("1 Schedule Record inserted");
                resolve(result);
              }
            });
          });
        });
         // Send a single response after all inserts
        Promise.all(schedulePromises)
          .then(results => res.json({ message: "Class and schedule inserted", classId: classInsertID, scheduleResults: results })) 
          .catch(err => res.status(500).json(err)); // Handle errors from schedule inserts

    });
});


app.post('/postClassesTaken', (req, res) => {
    console.log("Classes Taken POST...")
    //Properties from body object declared as variables
    const studentsToAdd = req.body.studentsToAdd;
    const studentsToRemove = req.body.studentsToRemove;
    const classID = req.body.classID

    //Array of promises, each one represents the success or failure of inserting student into class
    const addStudentPromises = studentsToAdd.map(student => {
        // Parameterized SQL query inserts record into ClassesTaken table
        const addSQL = "INSERT INTO ClassesTaken(takenStudentID, takenClassID) VALUES(?, ?)"
        return new Promise((resolve, reject) => {
            db.query(addSQL, [student, classID], (err, result) => {
                if(err) reject(err) //if error return failure
                else {
                    console.log("1 ClassesTaken record inserted")
                    resolve(result) //if query successful return success
                }
            })
        })
    })

    //Array of promises, each one represents the success or failure of removing student from class
    const removeStudentPromises = studentsToRemove.map(student => {
        // Parameterized SQL query remove record into ClassesTaken table
        const removeSQL = "DELETE FROM ClassesTaken WHERE takenStudentID = ? AND takenClassID = ?"
        return new Promise((resolve, reject) => {
            db.query(removeSQL, [student, classID], (err, result) => {
                if(err) reject(err); //if error return failure
                else {
                    console.log("1 ClassesTaken record deleted")
                    resolve(result) //if query successful return success
                }
            })
        })
    })

    //Iterate through each Promise both inserting and removing students and running them.
    Promise.all([...addStudentPromises, ...removeStudentPromises])
    //Will return a success if all ClassesTaken modifications on each promise is a success.
    //Successful result is sent in response
    .then(results => {
        console.log("ClassesTaken table updated successfully. Results:", results);
        res.json({ message: "ClassesTaken table updated", content: results });
    })
    //If one promise fails the whole operation fails. Error is sent in response
    .catch(err => {
        console.error("Error updating ClassesTaken table:", err);
        res.status(500).json({ error: "Failed to update ClassesTaken table", details: err.message });
    })

})


app.use((err, req, res, next) => {
    console.error('Request failed:', err.code || err.message);
    res.status(500).json({ error: 'Request failed. Please try again.' });
});

return app;
}

module.exports = { createApp };
if (require.main === module) {
    const app = createApp(createDatabase());
    const port = Number(process.env.PORT || 8081);
    app.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port}`));
}
