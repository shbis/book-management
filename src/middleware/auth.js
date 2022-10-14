//==========================Authentication & Authorization============================>
import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        const token = req.headers["x-api-key"];
        if (!token)
            return res.status(400).send({ status: false, message: 'Token must be present' })

        jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
            if (err)
                return res.status(401).send({
                        status: false, message: 'Authentication Failed!', error: err.message
                    })

            req['user'] = payload.userId;
            next()
        });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};

export default auth 
