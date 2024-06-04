const { Router } = require('express')
const ngoRoute = require('./ngo')
const router = Router()

router.use('/ngo', ngoRoute);

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "group!!"
    })
}) 

module.exports = router;