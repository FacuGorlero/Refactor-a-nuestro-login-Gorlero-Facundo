const { messageModel } = require('./Models/messages.model.js');

class MessageDaoMongo {
  constructor() {
    // Inicializa el DAO con el modelo de mensaje
    this.model = messageModel;
  }

  // Método para agregar un nuevo mensaje a la base de datos
  async addMessage(newMessage) {
    try {
      // Crea un nuevo mensaje en la base de datos
      await this.model.create(newMessage);
      // Devuelve todos los mensajes actualizados después de agregar el nuevo mensaje
      return await this.getMessages();
    } catch (error) {
      console.log(error);
    }
  }

  // Método para obtener todos los mensajes de la base de datos
  async getMessages() {
    try {
      // Devuelve todos los mensajes en la base de datos
      return await this.model.find({});
    } catch (error) {
      console.log(error);
    }
  }

  // Método para eliminar todos los mensajes de la base de datos
  async clearMessages() {
    try {
      // Elimina la colección completa de mensajes
      return await this.model.deleteMany({});
    } catch (error) {
      console.log(error);
    }
  }
}

// Exporta el DAO para su uso en otros archivos
exports.MessageMongo = MessageDaoMongo;