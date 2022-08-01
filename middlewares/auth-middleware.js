import jwt from 'jsonwebtoken';
import userModel from '../models/User.js';


const checkUserAuthentication = async(req,res, next) => {
    let token;
    const { authorization } = req.headers;

    if(authorization && authorization.startsWith('Bearer')){
        try {
            
            token = authorization.split(' ')[1];
    
            //verify token
            const { userId } = jwt.verify(token,process.env.JWT_SECRET_KEY);
    
            //GET user from token
            req.user = await userModel.findById(userId).select('-password');
            next();
        } catch (error){
            console.log(error);
            res.send({"status": "failed","message":"Unauthorized user"});
        }
    }
    if (!token) {
        res.status(401).send({"status":"failed","message":"Unauthorized user, no token"});
    }
}

export default checkUserAuthentication;