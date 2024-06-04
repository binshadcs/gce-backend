const { JwtScret } = require("../config/config");
const jwt = require('jsonwebtoken');

async function userAuth(req, res, next) {
   const { cookies } = req;
    if(cookies.token) {
        try {
            const result = jwt.verify(cookies.token, JwtScret)
            if(result.roleId === 1) {
               req.userId = result.id
               req.userGrpId = result.groupId
               next()
            } else {
                res.status(400).json({
                    message : "Try to access with user credential"
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

module.exports = {userAuth}