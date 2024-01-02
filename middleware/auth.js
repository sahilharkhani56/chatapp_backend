import jwt from 'jsonwebtoken'
import ENV from '../config.js'
// auth middleware
export default async function Auth(req,res,next){
    try{
        const token= req.headers.authorization.split(" ")[1];
        // console.log(token);
        // retrive user detail for the logged in user
        const decodedToken=jwt.verify(token, ENV.JWT_SECRET)
        // console.log(decodedToken);
        req.user=decodedToken;
        // res.json(decodedToken)
        // after that we want to run controler.updateuser so
        next();
    }
    catch(error){
        // console.log(error);
        res.status(401).json({error:`Authentication Error ${error.message}`})
    }
}
