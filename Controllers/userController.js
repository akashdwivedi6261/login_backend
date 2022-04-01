const bcrypt = require("bcrypt");
const _= require("lodash");
const axios = require("axios");
const otpGenerator = require("otp-generator");

const {User} = require("../Model/userModel")
const {Otp} = require("../Model/otpModel")

module.exports.signUp = async (req, res) => {
    console.log(req.body);
    const user = await User.findOne({
        number: req.body.number
    })
    console.log(user);
    if(user) {
        console.log("User exist");
        return res.status(400).send({message:"User already registered"})
    }
    const OTP = otpGenerator.generate(6, {
        digits: true, alphabets: false, upperCase: false, specialChars: false
    });

    const number = req.body.number;
    console.log("number", number);
    console.log(OTP);

    const otp = new Otp({number: number, otp: OTP});
    console.log(otp);
    const salt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, salt)
    const result = await otp.save();
    return res.status(200).send( {"otp": OTP})
}

module.exports.verifyOtp = async (req, res) => {

    const otpHolder = await Otp.find({
        number: req.body.number
    });

    if(otpHolder.length === 0) return res.status(400).send("You use an expired otp");
    const rightOtpFind = otpHolder[otpHolder.length-1]; //getting last otp 
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);
    console.log("right", validUser)

    if(rightOtpFind.number === req.body.number && validUser) {
        const user = new User(_.pick(req.body, ["number"]));
        const token = user.generateJWT();
        const result = await user.save();
        const OTPDelete = await Otp.deleteMany({
            number: rightOtpFind.number
        });

        return res.status(200).send({
            message: "User registration Successfull",
            token: token,
            data: result
        })
    }
    else {
        return res.status(400).send("Your otp was wrong")
    }

}

module.exports.login = async (req, res) => {
    try {
        //1. Does user exists
        let user = await User.findOne({number: req.body.number})
        //2. if doesnt exist throw 400
        if(!user) {
            return res.status(400).json("User is not registerd")
        }
        //3. if exists then check if number is matching
        const matching = user.checkNumber(req.body.number)
        //4. if not matching then throw 400
        if(!matching) {
            return res.status(400).json("User phone number is incorrect");
        }
        //5. if matching then give him the token
        const OTP = otpGenerator.generate(6, {
            digits: true, alphabets: false, upperCase: false, specialChars: false
        });
    
        const number = req.body.number;
        console.log(OTP);
    
        const otp = new Otp({number: number, otp: OTP});
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt)
        const result = await otp.save();
        return res.status(200).json({otp: OTP, message:"User exist, plese verify otp"})
    } catch (error) {
        return res.status(500).json({status: "failed", message: error.message})
    }
}

module.exports.verifyLoginOtp = async(req, res) => {
    const otpHolder = await Otp.find({
        number: req.body.number
    });

    if(otpHolder.length === 0) return res.status(400).send("You use an expired otp");
    const rightOtpFind = otpHolder[otpHolder.length-1]; //getting last otp 
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);
    console.log("right", validUser)

    if(rightOtpFind.number === req.body.number && validUser) {
        const user = new User(_.pick(req.body, ["number"]));
        const token = user.generateJWT();
        const OTPDelete = await Otp.deleteMany({
            number: rightOtpFind.number
        });

        return res.status(200).send({
            message: "User Login Successfull",
            token: token
        })
    }
    else {
        return res.status(400).send("Your otp was wrong")
    }
}

