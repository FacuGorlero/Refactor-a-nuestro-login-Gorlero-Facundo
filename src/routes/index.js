const { Router } = require('express')
const { viewsrouter } = require('./views.route.js');
const { productsrouter } = require('./products.route.js');
//const { sessionRouter } = require('./apis/session.route.js');
const { cartsRouter } = require('./cart.route.js');
const { MessageMongo } = require('../Daos-Mongo/mongo/message.daomongo.js');


const router = Router()
const messages = new MessageMongo();

// definiendo vistas
router.use('/', viewsrouter);

// FIXME: arreglar este delete
// definiendo la API
router.use('/api/products/', productsrouter);
router.use('/api/carts/', cartsRouter);

//router.use('/api/sessions/', sessionRouter)
router.delete('/api/messages', async (req, res) => {
  await messages.clearMessages();
  res.status(200).json({
    status: 'ok',
  });
})
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error de server');
});

module.exports = router