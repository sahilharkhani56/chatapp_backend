import mongoose from 'mongoose'
export const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required : [true,'Please Provide Unique Username'],
    },
    password:{
        type:String,
        required : [true,'Please Provide Unique Password'],
        unique:false,
    },
    email:{
        type:String,
        required :[true,'Please Provide Unique Email Address'],
    },
    profile:{
        type:String,
    },
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    mobile:{
        type:Number,
    },
    address:{
        type:String,
    },
    
})
export default mongoose.model.Users || mongoose.model('User',UserSchema)