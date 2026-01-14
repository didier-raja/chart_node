const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static('uploads'));

const connection = mysql2.createConnection({
    host: "localhost",
    user: "root", 
    password: "",
    database: "imagedb"
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// FIXED: Changed route to /employees and matched variable names to Frontend/DB
app.post('/employees', upload.single('image'), (req, res) => {
    const { First_name, last_name, email, department } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const sql = "INSERT INTO employees (First_name, last_name, email, department, image_path) VALUES (?, ?, ?, ?, ?)";
    connection.query(sql, [First_name, last_name, email, department, imagePath], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Success", image: imagePath });
    });
});

// FIXED: Changed route to /employees
app.get('/employees', (req, res) => {
    connection.query("SELECT * FROM employees", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));