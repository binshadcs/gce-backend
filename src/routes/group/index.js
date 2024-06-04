const { Router } = require('express');
const ngoRoute = require('./ngo');
const schoolRoute = require('./school');
const promoterRoute = require('./promoter')
const residRoute = require('./residencassoci')
const router = Router();

router.use('/ngo', ngoRoute);
router.use('/school', schoolRoute);
router.use('/promoter', promoterRoute);
router.use('/residence_association', residRoute);

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "group!!"
    })
}) 

module.exports = router;