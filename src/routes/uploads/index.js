const { Router } = require('express');
const { userAuth } = require('../../middleware/user');
const { Db } = require('../../config/db');
const router = Router()

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "uploads!!"
    })
}) 

router.get('/all', userAuth, async(req, res)=> {
    try {
        const [Uploads] = await Db.promise().query('SELECT * FROM tbl_uploads limit 20')
        if(Uploads.length !==0) {
            res.status(404).json({
                Uploads
            })
        } else {
            res.status(200).json({
                message : "Uploads not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch Uploads"
        })
    } 
});

router.get('/me', userAuth, async(req, res)=> {
    try {
        const [Uploads] = await Db.promise().query('SELECT * FROM tbl_uploads where up_reg_id = ? ',[req.userId])
        if(Uploads.length !==0) {
            res.status(404).json({
                Uploads
            })
        } else {
            res.status(200).json({
                message : "user don't have Uploads"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message : "can't fetch Uploads"
        })
    } 
});

module.exports = router;