const { Router } = require('express');
const ngoRoute = require('./ngo');
const schoolRoute = require('./school');
const router = Router();

router.use('/ngo', ngoRoute);
router.use('/school', schoolRoute);

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "group!!"
    })
}) 

module.exports = router;