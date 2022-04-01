const {Schema, model} = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = Schema({
    number: {type: String, required: true, unique: true, minLength: 10}
}, {timestamps: true});

userSchema.methods.generateJWT = function() {
    const token = jwt.sign({
        _id: this._id,
        number: this.number
    }, process.env.JWT_SECRET_KEY, {expiresIn: "7d"})
    return token;

}

userSchema.methods.checkNumber = function(number) {
    console.log("stored number", this.number);
    return this.number === number
}
module.exports.User = model('User', userSchema)