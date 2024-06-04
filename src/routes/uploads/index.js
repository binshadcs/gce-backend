const { Router } = require('express');
const { userAuth } = require('../../middleware/user');
const { CreateUploads } = require('../../types');
const { Db } = require('../../config/db');
const router = Router()

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "uploads!!"
    })
}) 

router.get('/all', userAuth, async(req, res)=> {
    try {
        const [Uploads] = await Db.promise().query('SELECT up_id,up_name,up_planter,up_tree_name,up_group_id,up_date,up_file FROM tbl_uploads limit 20')
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
        const [Uploads] = await Db.promise().query('SELECT up_id,up_name,up_planter,up_tree_name,up_group_id,up_date,up_file FROM tbl_uploads where up_reg_id = ? ',[req.userId])
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

router.post('/new', userAuth, async(req, res)=> {
    const { name, planterName, treeName, image } = req.body;
    const userId = req.userId;
    const groupId = req.userGrpId;
    const result = CreateUploads.safeParse({
        userId,
        name,
        planterName,
        treeName,
        image,
        groupId
    })
    if(result.success) {
        try {
            let [{insertId}] = await Db.promise().query('INSERT INTO tbl_uploads (up_reg_id, up_name, up_planter, up_tree_name, up_group_id, up_file ) VALUES(?, ?, ?, ?, ?, ?)',[userId,
                name,
                planterName,
                treeName,
                groupId,
                image    
            ])
            res.status(200).json({
                uploadsId : insertId
            })
        } catch (error) {
            res.status(400).json({
                message : "can't insert uploads"
            })
        }
    } else {
        res.state(403).json({
            message : "Invalid data"
        })
    }
});

module.exports = router;