import userModel from "../models/User.js";
import bcrypt, { hash } from 'bcrypt';
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
    static userRegistration = async(req, res) => {
        const {name, email, password, password_confirmation, tc} = req.body;
        const user = await userModel.findOne({email: email});
        
        if (user){
            res.send({"status":"failed", "message": "Email already exists."});
        } else {
            if (name && email && password && password_confirmation && tc) { 
                if (password === password_confirmation) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(password,salt);
                        const doc = new userModel({
                            name: name,
                            email: email,
                            password: hashedPassword,
                            tc: tc
                        });
                        await doc.save();
                        const saved_user = await userModel.findOne({email: email});
                        
                        // Generate JWT token
                        const token = jwt.sign({userId: saved_user._id}, process.env.
                            JWT_SECRET_KEY, {expiresIn: '5d'});
                        
                        res.status(201).send({"status":"success", "message":
                        "user registered successfully", "token":token});
                    } catch (error){
                        res.send ({"status":"failed", "message": "Unable to register the user."});
                    }
                } else {
                    res.send({"status":"failed", "message": "Password and confirm password does not match."});
                }
            } else {
                res.send({"status":"failed", "message": "All fields must be entered."});
            }
        }
    }

    static userLogin = async (req, res) => {
        try {
            const {email,password} = req.body;
            if(email && password){
                const user = await userModel.findOne({email:email});
                if(user){
                    const matchPassword = await bcrypt.compare(password, user.password);
                    if (matchPassword){
                        // Generate JWT token
                        const token = jwt.sign({userId: user._id}, process.env.
                            JWT_SECRET_KEY, {expiresIn: '5d'});
                        res.send({"status":"success", "message": "Login Success", "token":token});
                    } else {
                        res.send({"status":"failed", "message":"email or password does not match"});
                    }
                } else {
                    res.send({"status":"failed", "message":"User does not exists"});
                }
            } else {
                res.send({"status":"failed", "message": "All fields must be entered."});
            }
        } catch (error){
            console.log(error);
            res.send({"status":"failed", "message": "Unable to login"});
        }
    }

    static changePassword = async (req, res) => {
        const {password, password_confirmation} = req.body;
        if (password && password_confirmation) {
            if (password !== password_confirmation) {
                res.send({"status":"failed", "message": "Password and confirm password does not match."});
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                await userModel.findByIdAndUpdate(req.user._id, {$set: {password: hashedPassword}});
                res.send({"status":"success", "message": "password changed successfully"});
            }
        } else {
            res.send({"status":"failed", "message": "All fields are required"});
        }
    }

    static loggedInUser  = async(req,res) => {
        res.send({"user": req.user});
    }

    static sendPasswordResetEmail = async(req,res) => {
        const { email } = req.body;
        if (email) {
            const user = await userModel.findOne({email: email});
            if (user){
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({userId: user._id}, secret, {expiresIn: '15m'});
                const link = `http://localhost/api/user/reset/${user._id}/${token}`
               
                //SEND email

                let info = await transporter.sendMail({
                    from:process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "Password reset link",
                    html:`<a href=${link}>Click here to reset password</a>`
                });
                res.send({"status":"success", "message": "Email is sent..."});
            } else {
                res.send({"status":"failed", "message": "Email does not exist"});
            }
        } else {
            res.send({"status":"failed", "message": "Email field is required"});
        }
    }


    static userPasswordReset = async(req, res) => {
        const {password, password_confirmation} = req.body;
        const {id, token} = req.params;
        const user = await userModel.findById(id);
        const secret = user._id + process.env.JWT_SECRET_KEY;

        try {
            jwt.verify(token, secret);
            if(password && password_confirmation) {
                if(password === password_confirmation){
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await hash(password, salt);
                    await userModel.findByIdAndUpdate(user._id, {$set: {password: hashedPassword}});

                    res.send({"status":"success", "message": "Password reset successfully"});
                } else {
                    res.send({"status":"failed", 
                    "message": "Password and password_confirmation fields do not match"});
                }
            } else {
                res.send({"status":"failed", "message": "All fields are required"});
            }
        } catch (error) {
            console.log(error);
        }

    }
}
export default UserController;
