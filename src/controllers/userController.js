import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import { dataValidation } from '../util/commonValidator.js';
import { isValidEnum, isValidNumber, isValidEmail, isValidPwd, isValidStr, } from '../util/userValidate.js';

//==========================================createUser==============================================>
const createUser = async (req, res) => {
  try {
    const reqBody = req.body
    const { title, name, phone, email, password, address } = reqBody

    //------------------------------body validation-----------------------------------
    if (!dataValidation(reqBody))
      return res.status(400).send({ status: false, message: 'Please fill the data' })

    if (Object.keys(reqBody).length > 6)
      return res.status(400).send({ status: false, message: 'You can\'t add extra field' })

    //----------------------------------title validation------------------------------
    if (!title)
      return res.status(400).send({ status: false, message: 'title is  mandatory.' });

    if (!isValidEnum(title))
      return res.status(400).send({ status: false, message: 'title should be of Mr/Mrs/Miss.' });

    //----------------------------------name validation------------------------------
    if (!name)
      return res.status(400).send({ status: false, message: 'name is  mandatory.' });

    if (!isValidStr(name))
      return res.status(400).send({ status: false, message: 'name should be only string.' });
    
    //----------------------------------address validation------------------------------
    if (!address)
      return res.status(400).send({ status: false, message: 'address is  mandatory.' });

    if (typeof address !== 'object' || Array.isArray(address) || Object.keys(address).length == 0) 
      return res.status(400).send({ status: false, message: 'address should be an object' })
    
    //----------------------------------pincode validation------------------------------
    const pin = address.pincode.length
    if (pin > 6 || pin < 6)
      return res.status(400).send({ status: false, message: 'pincode should be 6 dist' })

    //--------------------------------exitsUser-----------------------------------
    const exitsUser = await userModel.find()

    //----------------------------------phone validation------------------------------
    if (!phone)
      return res.status(400).send({ status: false, message: 'Phone is  mandatory.' });

    if (!isValidNumber(phone))
      return res.status(400).send({ status: false, message: 'Please enter 10 digit phone number.' });

    //------------------------------finding duplicate phone------------------------------
    for (let i = 0; i < exitsUser.length; i++) {
      if (exitsUser[i].phone == phone)
        return res.status(400).send({ status: false, message: `This '${phone}' phone no is already registered.`  })
    }

    //------------------------------email validation---------------------------------
    if (!email)
      return res.status(400).send({ status: false, message: 'phone is  mandatory.' })

    if (!isValidEmail(email))
      return res.status(400).send({ status: false, message: 'Please enter a valid email.' })

    //------------------------------finding duplicate email------------------------------
    for (let i = 0; i < exitsUser.length; i++) {
      if (exitsUser[i].email == email)
        return res.status(400).send({ status: false, message: `This '${email}' Email-Id is already registered.` })
    }
    //---------------------------------password validation------------------------------
    if (!password)
      return res.status(400).send({ status: false, message: 'password is  mandatory.' });

    if (!isValidPwd(password))
      return res.status(400).send({ status: false, message: 'Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.' });

    //-------------------password hashing-------------------
    const hashPassword = await bcrypt.hash(password, 10);
    req.body.password = hashPassword

    //-------------------user creation-------------------
    const result = await userModel.create(reqBody);

    return res.status(201).send({ status: true, message: 'Registration Successfully', data: result });

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//==========================================userLogin==============================================>
const userLogin = async (req, res) => {
  try {
    const reqBody = req.body
    const { email, password } = reqBody

    //------------------------------body validation-----------------------------------
    if (!dataValidation(reqBody))
      return res.status(400).send({ status: false, message: 'Please fill the data' })

    if (Object.keys(reqBody).length > 2)
      return res.status(400).send({ status: false, message: 'You can\'t add extra field' })

    //------------------------------email validation---------------------------------
    if (!email)
      return res.status(400).send({ status: false, message: 'Email is Required.' });

    if (!isValidEmail(email))
      return res.status(400).send({ status: false, message: `This '${email}' Email-Id is invalid.` });
    //------------------------------password validation---------------------------------
    if (!password)
      return res.status(400).send({ status: false, message: 'Password Required.' });

    if (!isValidPwd(password))
      return res.status(400).send({ status: false, message: 'Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.', });

    //--------------------------------exitsUser-----------------------------------
    const existUser = await userModel.findOne({ email });

    if (!existUser)
      return res.status(401).send({ status: false, message: 'Please register first.' });

    // ---------------------------decoding hash password---------------------------
    const matchPass = bcrypt.compare(password, existUser.password);

    if (!matchPass)
      return res.status(400).send({ status: false, message: 'Password is wrong.' })

    // ---------------------------token generation--------------------------
    const payload = { userId: existUser._id, iat: Math.floor(Date.now() / 1000) };

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '365d' });

    // --------------------------------response--------------------------------------
    return res.status(200).send({ status: true, message: 'Login Successful.', token: token, exp: payload.exp, });

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

export { createUser, userLogin };
