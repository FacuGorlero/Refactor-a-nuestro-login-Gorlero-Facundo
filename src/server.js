const express = require('express');
const { createServer} = require('node:http');
const serverIo = require('./routes/serverIO.js');
const {connectDb} = require('./config/index.js');
//const session = require('express-session');
const session = require('express-session')
const cookieParser = require('cookie-parser')

const handlebars = require('express-handlebars');
const { viewsrouter } = require('./routes/views.route.js');
const appRouter     = require('./routes');
const sessionsRouter = require('./routes/session.route.js')
const {userRouter} = require('./routes/user.router.js')

const port = 8080;
const app = express();
const server = createServer(app)
serverIo(server)

const passport = require('passport');
const {initializePassport} = require('./config/passport.config.js');

connectDb()


const FileStore = require('session-file-store')
const MongoStore = require('connect-mongo')


// middlewars de passport
initializePassport()
app.use(session({
    secret: 'p@l@br@seCret@'
}))
app.use(passport.initialize())
// app.use(passport.session())


// configuraciones de la App
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser('p@l@br@seCret@'))
/*app.use(session({
  secret: 'palabraSecretaa',
  resave: true,
  saveUninitialized: true
}))
app.use(cookieParser('palabraSecretaa'));*/

// motor de plantilla
app.engine('hbs', handlebars.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// definiendo vistas
app.use('/', viewsrouter);
app.use(appRouter)
app.use('/api/session', sessionsRouter)
app.use('/api/users', userRouter)

// Confirmacion de inicio
server.listen(port, () => {
  console.log(`Server andando en port ${port}`);
});

app.use(session({
  store: MongoStore.create({
      mongoUrl: 'mongodb+srv://facundogorlero:Lucas-10@zogk.a4uasms.mongodb.net/ecommerce?retryWrites=true&w=majority', // uri -> superconjunto de la url
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
      ttl: 15000000000,
  }),
  secret: 'secretCoder',
  resave: true, 
  saveUninitialized: true
}))
