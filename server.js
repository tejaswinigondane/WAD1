//require the modules express and mongoose
const express=require('express');
const mongoose=require('mongoose');

const port=7000;
const bodyParser = require('body-parser');
const app=express();
app.use(bodyParser.json());

//connection to database
mongoose.connect('mongodb://localhost/student',{useNewUrlParser: true,useUnifiedTopology: true})
    .then(()=>{
        console.log('Connected to MongoDb');
    })

    .catch((error)=>{
        console.error('Error connecting to Mongodb:',error);
    });

//defining the schema

const studentMarksSchema =new mongoose.Schema({
    Name:String,
    Roll_No:Number,           //postman may isi format may data entry krna hai
    WAD:Number,
    CC:Number,
    DSBDA:Number,
    CNS:Number,
    AI:Number
});

//creating the model for studentmarks

const StudentMarks=mongoose.model('studentmarks',studentMarksSchema);

//create a new student data
app.post('/student', (req, res) => {
    const studentData = req.body;
    StudentMarks.create(studentData)
      .then(() => {
        res.send('Student data added successfully');
      })
      .catch((error) => {
        res.status(500).send('Error creating student data');
      });
  });

app.get('/students', (req, res) => {
    StudentMarks.find()
      .then((students) => {
        const dataofstudent = students.map((student) => ({
          Name: student.Name,
          Roll_no: student.Roll_No,
          WAD_MARKS: student.WAD,
          CC_MARKS: student.CC,
          DSBDA_MARKS: student.DSBDA,
          CNS_MARKS: student.CNS,
          AI_MARKS: student.AI
        }));
        res.json(dataofstudent);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Error retrieving songs' });
      });
});

//total count
// app.get('/students', (req, res) => {
//   StudentMarks.find({}, (err, students) => {
//     if (err) {
//       console.error('Error retrieving students:', err);
//       res.status(500).json({ error: 'Error retrieving students' });
//       return;
//     }

//     const totalCount = students.length;
    
//     res.send(`Total count of documents: ${totalCount}<br><br>Documents:<br>${JSON.stringify(students, null, 2)}`);
//   });
// });


/*Names of student scored highest in dsbda more than 20*/

app.get('/students/dsbda', (req, res) => {
  StudentMarks.find({ DSBDA: { $gt: 20 } }, 'Name', (err, students) => {
    if (err) {
      console.error('Error retrieving students:', err);
      res.status(500).json({ error: 'Error retrieving students' });
      return;
    }

    const studentNames = students.map((student) => student.Name);

    res.send(`Students with more than 20 marks in DSBDA:<br>${studentNames.join('<br>')}`);
  });
});

/* increment marks by 10*/
app.put('/students/:name', (req, res) => {
  const name = req.params.name;

  StudentMarks.findOneAndUpdate(
    { Name: name },
    { $inc: { WAD: 10, CC: 10, DSBDA: 10, CNS: 10, AI: 10 } },
    { new: true }
  )
    .then((updatedStudent) => {
      if (!updatedStudent) {
        return res.status(404).send(`Student with name ${name} not found`);
      }
      res.send(`Marks updated for student with name ${name}`);
    })
    .catch((error) => {
      console.error('Error updating marks:', error);
      res.status(500).json({ error: 'Error updating marks' });
    });
});
app.get('/students/high-scorers', async (req, res) => {
  try {
    const students = await StudentMarks.find({
      WAD: { $gt: 25 },
      CC: { $gt: 25 },
      DSBDA: { $gt: 25 },
      CNS: { $gt: 25 },
      AI: { $gt: 25 }
    });

    const studentNames = students.map((student) => student.Name);

    res.json(studentNames);
  } catch (error) {
    console.error('Error retrieving high scorers:', error);
    res.status(500).json({ error: 'Error retrieving high scorers' });
  }
});

//remove students from colllection
app.delete('/students/:index', (req, res) => {
  const index = req.params.index; // Extract the index from the URL parameter

  // Delete the student document based on the index
  StudentMarks.deleteOne({}).skip(index).exec((err) => {
    if (err) {
      console.error('Error deleting student:', err);
      res.status(500).json({ error: 'Error deleting student' });
      return;
    }

    res.send('Student deleted successfully');
  });
});



//TABLE
app.get('/students/table', (req, res) => {
  StudentMarks.find({})
    .then((students) => {
      let tableHtml = '<table>';
      tableHtml += '<tr><th>Name</th><th>Roll No</th><th>WAD</th><th>DSBDA</th><th>CNS</th><th>CC</th><th>AI</th></tr>';

      students.forEach((student) => {
        tableHtml += `<tr><td>${student.Name}</td><td>${student.Roll_No}</td><td>${student.WAD}</td><td>${student.DSBDA}</td><td>${student.CNS}</td><td>${student.CC}</td><td>${student.AI}</td></tr>`;
      });

      tableHtml += '</table>';

      res.send(tableHtml);
    })
    .catch((err) => {
      console.error('Error retrieving students:', err);
      res.status(500).json({ error: 'Error retrieving students' });
    });
});

//start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });







