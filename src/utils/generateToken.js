import jwt from "jsonwebtoken";
import {JWT_SECRET_KEY, JWT_EXPIRES_IN} from "../config/env.js"

const generateToken = (id) => jwt.sign({id}, JWT_SECRET_KEY, {expiresIn: JWT_EXPIRES_IN});

export default generateToken;