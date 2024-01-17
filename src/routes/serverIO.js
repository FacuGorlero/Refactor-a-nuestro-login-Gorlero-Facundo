module.exports = function (server) {
    const { Server } = require('socket.io');
    const { MessageMongo } = require('../Daos-Mongo/mongo/message.daomongo');
    const { ProductMongo } = require('../Daos-Mongo/mongo/products.daomongo.js');
  
    const io = new Server(server)
  
    //const products = new PManager('./src/daos/file/mock/Productos.json');
    const products = new ProductMongo();
    const messages = new MessageMongo();
  
    io.on('connection', io => {
      console.log("Nuevo cliente conectado");
    
      //REAL TIME PRODUCT
      io.on('nuevoProducto', async newProduct => {
        await products.addProduct(newProduct);
  
        let resp = await fetch(`http://localhost:8080/api/products?limit=100`);
        resp = await resp.json()
        const listProduct = resp.payload;
        
        io.emit('productos', listProduct)
      })
    
      io.on('eliminarProducto', async code => {
        await products.deleteProductByCode(code);
        
        let resp = await fetch(`http://localhost:8080/api/products?limit=100`);
        resp = await resp.json()
        const listProduct = resp.payload;
        
        io.emit('productos', listProduct)
      })
    
      //CHAT
      io.on('message', async (data) => {
        const newMessages = await messages.addMessage(data);
        io.emit('messageLogs', newMessages)
      })
    
      io.on('init', async () => {
        io.emit('messageLogs', )
      })
    
      io.on('clean', async () => {
        await messages.clearMessages()
        io.emit('messageLogs', )
      })
    })
  }