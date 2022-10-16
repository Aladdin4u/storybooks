const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const exphbs = require('express-handlebars')
const connectDB = require('./config/db')


// Load config
dotenv.config({ path: 'config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// ejs Helpers
const { formatDate, stripTags, truncat, editIcon, select } = require('./helpers/hbs')

// handlebars
app.engine('.hbs', exphbs.engine({
    helpers: { 
        formatDate, 
        stripTags, 
        truncat, 
        editIcon, 
        select 
    },
    defaultLayout: 'main', 
    extname: '.hbs'
    })
)
app.set('view engine', '.hbs')

// Static Folder
app.use(express.static('public'))
// body Parsing
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
 
// Method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies ans delete it
        let method = req.body._method
        delete req.body._method
        return method;
    }
}))

// Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl:process.env.MONGO_URL })
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})
// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} node on port ${PORT}`))