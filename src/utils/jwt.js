// Importa el módulo JWT necesario para trabajar con tokens.
const jwt = require('jsonwebtoken')

// Establece una clave privada para firmar y verificar los tokens JWT.
const JWT_PRIVATE_KEY = "CoderSecretoJesonWebToken"

// Función para crear un token JWT.
// Toma un objeto de usuario y genera un token JWT firmado con la clave privada.
// El token expirará en 1 día ('1d').
const createToken = user => jwt.sign(user, JWT_PRIVATE_KEY, { expiresIn: '1d' })

// Middleware de autenticación por token.
// Verifica la autenticación a través de un token.

const authenticationToken = (req, res, next) => {
    // 1. Obtiene el encabezado de autorización (authHeader) de la solicitud.
    const authHeader = req.headers['authorization']
    
    // 2. Verifica si el encabezado está presente; de lo contrario, responde con un error de no autenticado.
    if (!authHeader) res.status(401).json({ status: 'error', error: 'not authenticated' })

    // 3. Extrae el token del encabezado y lo verifica con la clave privada.
    // 4. Si la verificación es exitosa, decodifica el token y agrega la información del usuario (userDecode) al objeto de solicitud (req.user).
    jwt.verify(authHeader.split(' ')[1], JWT_PRIVATE_KEY, (err, userDecode) => {
        if (err) return res.status(401).json({ status: 'error', error: 'not authorized' })
        req.user = userDecode
        next()
    })
}

// Exporta las funciones (createToken y authenticationToken) y la clave privada (JWT_PRIVATE_KEY)
// para que puedan ser utilizadas en otros archivos.
module.exports = {
    createToken,
    authenticationToken,
    JWT_PRIVATE_KEY
}
