const { JwtScret } = require("../config/config");
const jwt = require('jsonwebtoken');

// chech userid, role also
async function coordinatorAuth(req, res, next) {
    const { cookies } = req;
    const { authorization } = req.headers;
    if(authorization) {
        let token = await authorization.replace("Bearer ", "");
        try {
            // const result = jwt.verify(cookies.token, JwtScret)
            const result = jwt.verify(token, JwtScret)
            if(result.roleId === 2) {
                req.userId = result.id;
                req.groupId = result.groupId;
                next()
            } else {
                res.status(400).json({
                    message : "Unauthorized Access | You do not have permission to access this resource."
                })
            }
        } catch (error) {
            res.status(404).json({
                message : "token verification failed"
            })
        }
    } else {
        res.status(400).json({
            message : "Authorization header to found"
        })
    }
    // const word = authorization.split(" ");
    // if(cookies.token) {
    
        
    // } else {
    //     res.status(404).json({
    //         message : "Invalid token"
    //     })
    // }
    
}

module.exports = {coordinatorAuth}