const passport = require('passport');
const local = require('passport-local');
const UserDaoMongo = require('../Daos-Mongo/mongo/user.daomongo.js');
const { createHash, isValidPassword } = require('../utils/hashPassword.js');
const GitHubStrategy = require('passport-github2');

const LocalStategy = local.Strategy;
const userService = new UserDaoMongo();

exports.initializePassport = () => {

  // Configuración de la estrategia de autenticación de GitHub
  passport.use('github', new GitHubStrategy({
    clientID: 'Iv1.dde3fd9aaf258173',
    clientSecret: '89c7c44c5f28d3b47f0c1088caea827b7c21e09e',
    callbackURL: 'http://localhost:8080/api/session/githubcallback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile);

      // Verificar si el usuario ya existe en la base de datos
      let user = await userService.getUserBy({ email: profile._json.email });

      if (!user) {
        // Si no existe, crear un nuevo usuario con información de GitHub
        let userNew = {
          first_name: profile.username,
          last_name: profile.username,
          email: profile._json.email,
          password: '123456' // Contraseña temporal, ya que GitHub no proporciona contraseñas
        };

        let result = await userService.createUser(userNew);
        return done(null, result);
      }

      // Si el usuario existe, continuar con ese usuario
      done(null, user);

    } catch (error) {
      return done(error);
    }
  }));

  // Serializar al usuario para almacenarlo en la sesión
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserializar al usuario a partir del ID almacenado en la sesión
  passport.deserializeUser(async (id, done) => {
    let user = await userService.getUserBy({ _id: id });
    done(null, user);
  });

};
