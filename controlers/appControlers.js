import UserModel from "../model/userSchema.js";
import MessageModel from "../model/messageSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
{/*  */}

// import otpGenerator from "otp-generator";
// middlewere for verify user
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;
    // console.log(username);
    // check the user existance
    let exits = await UserModel.findOne({ username });
    if (!exits) return res.status(404).send({ error: `Can't find User!` });
    next();
  } catch (error) {
    return res.status(404).send({ error: `Can't find User!` });
  }
}
/** POST http://localhost:8080/api/register
 * @param:{
 * 
  "username":'a123',
 "password":'a@123',
 "email":'a@gmail.com',
 "profile":'',
 * }
 */
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;
    const existUserPromise = UserModel.findOne({ username });
    const existEmailPromise = UserModel.findOne({ email });
    const [user, email_] = await Promise.all([
      existUserPromise,
      existEmailPromise,
    ]);
    if (user) {
      throw new Error("Please Use Unique Username");
    }

    if (email_) {
      throw new Error("Please Use Unique Email");
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new UserModel({
        username,
        password: hashedPassword,
        profile: profile || "",
        email,
      });

      const result = await user.save();

      res.status(201).send({ msg: "User Registered Successfully!" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
/** POST http://localhost:8080/api/login
 * @param:{
 * 'username':'a123',
 * 'password':'a@123',
 * }
 */
export async function login(req, res) {
  const { username, password } = req.body;
  try {
    UserModel.findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({ error: "Wrong Password" });
            const token = jwt.sign(
              {
                userId: user.id,
                username: user.username,
              },
              ENV.JWT_SECRET,
              { expiresIn: "24h" }
            );
            // console.log(token);
            // const decodedToken=jwt.verify(token, ENV.JWT_SECRET)
            // console.log("hello");
            // console.log(decodedToken);
            return res.status(201).send({
              msg: "Login Successful..!",
              username: user.username,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: "Password doesn't Match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "User not Found" });
      });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
}
/** GET http://localhost:8080/api/user/a123 */
export async function getUser(req, res) {
  // we can find value of user 'a123' from req.params
  const { username } = req.params;
  try {
    if (!username) res.status(501).send({ error: "Invalid Username" });
    const existUserPromise = UserModel.findOne({ username });
    const [user] = await Promise.all([existUserPromise]);
    if (!user) return res.status(501).send({ error: "Couldn't find User" });
    // const [password,...rest]=user._doc;
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password; // Remove the password field
    return res.status(201).send(userWithoutPassword);
  } catch (error) {
    return res
      .status(404)
      .send({ error: `Can not find User Data ${error.message}` });
  }
}
/** PUT http://localhost:8080/api/updateuser
 * @param:{
 * "header":"<token>"
 * }
 * body:{
 * firstName:'',
 * address:'',
 * profile:'',
 * }
 */
export async function updateUser(req, res) {
  try {
    const { userId } = req.user;
    if (userId) {
      const body = req.body;
      await UserModel.updateOne({ _id: userId }, body);
      return res.status(201).send({ msg: "Record Updated" });
    } else {
      return res.status(401).send({ error: "User Not Found" });
    }
  } catch (error) {
    return res.status(401).send({ error: error.message });
  }
}

// successfully redirect user when otp valid
/** GET http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired!" });
}


export async function getAllUsers(req, res){
  try {
    // const {username}="a123"
      const allUser = await UserModel.find({ _id: { $ne: req.params.id }}).select([
        "username",
        "_id",
        "profile"
      ]);
      res.status(200).json(allUser);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
}
export async function addMessage(req,res,next){
  try{
    const {from,to,message}=req.body;
    const data =await MessageModel.create({
      message:{text:message},
      users:[from,to],
      sender:from,
    })
    // console.log(data.createdAt);
    if(data) return res.json({msg:"Message added successfully"})
    return res.json({msg:"Failed to add Message"})
  }
  catch(err){
    next(err)
  }
}
export async function getMessage(req,res,next){
  try{
    const {from,to}=req.body;
    const messages=await MessageModel.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    // console.log(messages[0]._id.getTimestamp().toLocaleTimeString().split(":")[0])
    // console.log(messages[0]._id.getTimestamp().toLocaleTimeString().split(":")[1])
    // console.log(messages[0]._id.getTimestamp().toLocaleTimeString().split(":")[2][1])
    
    // console.log(tt);

    const projectedMessages = messages.map((msg) => {
      const ar=msg._id.getTimestamp().toLocaleTimeString().split(":");
      const hour=ar[0];
      const min=ar[1];
      const len=ar[2].length;
      const tt=ar[2][len-2]+ar[2][len-1]
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        createdAt:hour+':'+min+' '+tt,
      };
    });
    res.json(projectedMessages);

  }
  catch(err){
    next(err)
  }
}
//  the HTTP PUT method is used to update an existing resource, while the POST method is used to create a new resource
// GET- It requests the data from a specified resource. POST- It submits the processed data to a specified resource.
// GET carries request parameter appended in URL string while POST carries request parameter in message body
