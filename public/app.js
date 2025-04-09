const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_todo',
});

// Routes
// Get all todos
app.get('/todos', (req, res) => {  
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connected as ID: ${connection.threadId}`);

        connection.query('SELECT * FROM my_todo', (err, rows) => {
            connection.release();
            if (!err) {
                res.json(rows);
            } else {
                console.log(err);
                res.status(500).send('Database error');
            }
        });
    });
});

// Get a specific todo
app.get('/todos/:id', (req, res) => {  
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID: ${connection.threadId}`);

        connection.query('SELECT * FROM my_todo WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release(); 
            if (!err) {
                res.json(rows[0]);  
            } else {
                console.log(err);
                res.status(500).send('Database error');
            }
        });
    });
});

// Delete todo
app.delete('/todos/:id', (req, res) => { 
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as id: ${connection.threadId}`);

        connection.query('DELETE FROM my_todo WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release(); 
            if (!err) {
                res.send(`Todo with ID: ${req.params.id} has been removed.`);  
            } else {
                console.log(err);
                res.status(500).send('Database error');
            }
        });
    });
});

// Add todo
app.post('/todos', (req, res) => { 
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as id: ${connection.threadId}`);

        const params = req.body;
        connection.query('INSERT INTO my_todo SET ?', params, (err, result) => {
            connection.release(); 
            if (!err) {
                res.send(`Todo with the task: ${params.task} has been added with ID: ${result.insertId}`); 
            } else {
                console.log(err);
                res.status(500).send('Database error');
            }
        });
        console.log(req.body);
    });
});

// Update todo
app.put('/todos', (req, res) => {  
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connection as ID: ${connection.threadId}`);

        const { id, task, description, duedate, completed } = req.body;
        connection.query(
            'UPDATE my_todo SET task = ?, description = ?, duedate = ?, completed = ? WHERE id = ?', 
            [task, description, duedate, completed, id], 
            (err, rows) => {
                connection.release(); 
                if (!err) {
                    res.send(`Todo with ID: ${id} has been updated.`);  
                } else {
                    console.error(err);
                    res.status(500).send('Database error');
                }
            }
        );
        console.log(req.body);
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));