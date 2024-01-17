// Importación de módulos y configuración inicial
const { Router } = require('express');
const { authentication } = require('../helper/auth.midleware');
const { userModel } = require('../Daos-Mongo/mongo/Models/user.model.js');
const { createHash, isValidPassword } = require('../utils/hashPassword.js');
const passport = require('passport');
const { createToken, authenticationToken } = require('../utils/jwt.js');

// Creación de un router de Express
const router = Router();
  // Creación de una instancia de modelo de usuario

// Registro de un nuevo usuario
router.post('/register', async (req, res) => {
    // Recuperación de datos del cuerpo de la solicitud
    const { first_name, last_name, email, password } = req.body;

    // Validación de campos obligatorios
    if (first_name === '' || password === "" || email === '') {
        return res.send('Faltan completar campos obligatorios');
    }

    // Verificación de existencia del usuario
    const userFound = await userModel.findOne({ email });
    if (userFound) {
        return res.send({ status: 'error', error: 'Ya existe el usuario' });
    }

    // Creación de un nuevo usuario en la base de datos con contraseña encriptada
    const newUser = {
        first_name,
        last_name,
        email,
        password: createHash(password),
    };
    const result = await userModel.create(newUser);

    // Creación de un token JWT para el nuevo usuario
    const token = createToken({ id: result._id });

    // Respuesta con información del usuario y el token
    res.send({
        status: 'success',
        payload: {
            first_name: result.first_name,
            last_name: result.last_name,
            email: result.email,
            _id: result._id,
        },
        token,
    });
});

// Inicio de sesión de usuario
router.post('/login', async (req, res) => {
    // Recuperación de datos del cuerpo de la solicitud
    const { email, password } = req.body;

    // Validación de campos obligatorios
    if (email === '' || password === '') {
        return res.send('Todos los campos son obligatorios');
    }

    // Búsqueda del usuario por su correo electrónico
    const user = await userModel.findOne({ email });

    // Verificación de existencia del usuario
    if (!user) {
        return res.send('Email o contraseña equivocados');
    }

    // Comparación de contraseñas
    if (!isValidPassword(password, user)) {
        return res.send('Email o contraseña equivocados');
    }

    // Establecimiento de la sesión del usuario y redirección
    req.session.user = {
        user: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        admin: true,
    };
    res.redirect('/');
});

// Ruta protegida que solo puede ser accedida por usuarios autenticados
router.get('/current', authentication, (req, res) => {
    res.send('Información sensible que solo puede ver el administrador');
});

// Ruta para iniciar sesión a través de GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {});

// Ruta que maneja la redirección después de la autenticación con GitHub
router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.send({ status: 'error', error: err });
    });
    res.send('Logout exitoso');
});

// Exportación del router para su uso en otras partes de la aplicación
module.exports = router;
