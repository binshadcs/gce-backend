const { Router } = require('express');
const { Db } = require('../../config/db');
const { hashPassword, comparePassword } = require('../util');
const router = Router()

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "coordinator!!"
    })
}); 

router.get('/all', async(req, res)=> {
    try {
        const [coordinators] = await Db.promise().query('select * from tbl_group_coordinators')
        if(coordinators.length > 0) {
            res.status(404).json({
                coordinators
            })
            Db.end()
        } else {
            res.status(200).json({
                message : "coordinators not found"
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(404).json({
            message : "can't fetch coordinators"
        })
    }
}) 

router.post('/register', async(req, res)=> {
    const { password } = req.body;
    const result = await hashPassword(password)
    res.status(200).json({
        message : result
    })
});

router.post('/login', async(req, res)=> {
    const { password } = req.body;
    const result = await comparePassword(password, '$2b$10$XxiqjM4fkoPwtSTzFZTHIebbPksIkqHoLh4tyb/WC3OrakxuoT7sy')
    res.status(200).json({
        message : result
    })
});

module.exports = router;