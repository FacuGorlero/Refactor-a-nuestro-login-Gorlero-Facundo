const { userModel } = require("./Models/user.model");

class UserDaoMongo {
    constructor() {
      this.model = userModel;
    }
  
    getUsersPaginate = async (limit=10, page=1) => await thism.model.paginate({}, {limit, page, lean: true})
  
    getUsers = async () => await this.model.find({})
    getUserBy = async (filter) => await this.model.findOne({filter})
    createUser = async (newUser) => await this.model.create(newUser)
    updateUser = async (uid, userUpdate) => await this.model.findOneAndUpdate({_id: uid}, userUpdate)
    deleteUser = async (uid) => await this.model.findOneAndDelete({_id: uid})
  }

module.exports = UserDaoMongo