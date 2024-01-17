const {Router} = require('express');
const router = Router();
const {userModel} = require('../Daos-Mongo/mongo/Models/user.model.js');

router.get('/',  async (req,res) => {
    try {const users = await userModel.find({})
    res.send(users);
}catch (error) {
    console.log(error);
}
    
   })

   router.post('/', async (req,res) => {
    try{const{first_name, last_name, email} = req.body
    const result = await userModel.create({
        first_name,
        last_name,
        email
    })

    console.log(first_name, last_name,email);

    res.status(201).send({
        status: 'success',
        payload: result
    })
}
    catch (error) {
        console.log(error);
    }
   })

   router.put('/:uid',  async (req, res) =>{

    const { uid } = req.params
    const userToReplace = req.body
    // venga el id
    const result = await userModel.updateOne({_id: uid}, userToReplace)
    res.status(201).send({ 
        status: 'success',
        payload: result 
    })
})

// DELETE localhost:8080  /api/users /:uid
router.delete('/:uid', async  (req, res)=> {
    const { uid } = req.params

    const result = await userModel.deleteOne({_id: uid})
    res.status(200).send({ 
        status: "success", 
        payload: result 
    })
})


   exports.userRouter = router;