const { JwtScret } = require("../config/config");
const jwt = require('jsonwebtoken');

// chech userid, role also
async function coordinatorAuth(req, res, next) {
    const { cookies } = req;
    if(cookies.token) {
        try {
            const result = jwt.verify(cookies.token, JwtScret)
            if(result.roleId === 2) {
                next()
            } else {
                res.status(400).json({
                    message : "Try to access with coordinator credential"
                })
            }
        } catch (error) {
            res.status(404).json({
                message : "token verification failed"
            })
        }
        
    } else {
        res.status(404).json({
            message : "Invalid token"
        })
    }
    
}

module.exports = {coordinatorAuth}