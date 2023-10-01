const express = require('express')
const mysql = require('mysql')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const bodyParser = require('body-parser')

// Dummy user information for login (replace with your authentication logic)
const userInfo = {
  fullname: 'Nick Njeru',
  username: 'Nick',
  password: '1234', // Make sure to use a string for the password
}

const app = express()

const options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'session_nodejs',
}

const sesconnection = mysql.createConnection(options)

// Configure a MySQL session store to store session data in the database
const sessionStore = new MySQLStore(
  {
    expiration: 10000000, // Session expiration time in milliseconds
    createDatabaseTable: true, // Create the necessary table in the database
    schema: {
      tableName: 'sessiontbl',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data',
      },
    },
  },
  sesconnection
)

// Configure express-session middleware at the top
app.use(
  session({
    key: 'keyme',
    secret: 'nicksonmunenenjerunjirunjeruva', // Secret for session data encryption
    store: sessionStore, // Use the MySQL session store
    resave: false,
    saveUninitialized: true,
  })
)

// Configure body-parser middleware for JSON parsing
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Login route: Handles user login using a POST request
app.post('/login', function (req, res) {
  const { username, password } = req.body

  // Dummy authentication logic (replace with your actual authentication logic)
  if (username !== userInfo.username || password !== userInfo.password) {
    return res.status(401).json({
      error: true,
      message: 'Username or password is invalid',
    })
  } else {
    // Store user information in the session upon successful login
    req.session.userInfo = userInfo.fullname
    res.send('Login successful')
  }
})

// Logout route: Destroys the user's session
app.get('/logout', function (req, res) {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err)
    }
    res.redirect('/')
  })
})

// Display user information route: Shows user information if logged in
app.get('/', function (req, res) {
  if (req.session.userInfo) {
    res.send(
      'Hello ' + req.session.userInfo + ' | <a href="/logout">Logout</a>'
    )
  } else {
    res.send('You are not logged in | <a href="/login.html">Login</a>')
  }
})

const PORT = process.env.PORT || 3000

sesconnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err)
    return
  }
  console.log('Connected to MySQL')

  app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`)
  })
})
