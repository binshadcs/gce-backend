const { Router } = require('express');
const { userAuth } = require('../../middleware/user');
const { CreateUploads, ImageFileValidate } = require('../../types');
const { Db } = require('../../config/db');
const { uploadMulter } = require('../../config/fileMulter');
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { bucketName, s3 } = require('../../config/bucket');
const { randomImageName } = require('../util');
const sharp = require('sharp');

const router = Router()

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "uploads!!"
    })
}) 

router.get('/all', async(req, res)=> {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [Uploads] = await Db.promise().query('SELECT up_id,up_name,up_planter,up_tree_name,up_group_id,up_date,up_file FROM tbl_uploads order by up_date DESC limit ? offset ?', [limit, offset])
        if(Uploads.length !== 0) {
            res.status(200).json({
                Uploads,
                success : true
            })
        } else {
            res.status(204).json({
                message : "Uploads not found",
                success : false
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "SQL Query Execution Failed | Can't fetch Uploads",
            success : false,
            error : error.message
        })
    } 
});

router.get('/me', userAuth, async(req, res)=> {
    try {
        const [Uploads] = await Db.promise().query('SELECT up_id,up_name,up_planter,up_tree_name,up_group_id,up_date,up_file FROM tbl_uploads where up_reg_id = ? ORDER BY up_date DESC',[req.userId])
        if(Uploads.length !==0) {
            res.status(200).json({
                Uploads,
                success : true
            })
        } else {
            res.status(204).json({
                message : "user don't have Uploads",
                success : false
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "SQL Query Execution Failed | Can't fetch Uploads",
            success : false,
            error : error.message
        })
    } 
});

router.post('/new', userAuth, uploadMulter.single('image'), async(req, res)=> {
    const { name, planterName, treeName } = req.body;
    const userId = req.userId;
    const groupId = req.userGrpId;
    if(req.file !== undefined) {
        const type = req.file.mimetype;
        const size = req.file.size;
        const resultImage = ImageFileValidate.safeParse({type, size})
        const result = CreateUploads.safeParse({
            userId,
            name,
            planterName,
            treeName,
            groupId
        })
        const buffer = await sharp(req.file.buffer).resize(600).toBuffer()
        let generatedImageName = randomImageName()
        const command = new PutObjectCommand({
            Bucket : bucketName,
            Key : generatedImageName,
            Body : buffer,
            ContentType : req.file.mimetype
        })
        if(result.success && resultImage.success) {
            try {
                await s3.send(command);
                let [{insertId}] = await Db.promise().query('INSERT INTO tbl_uploads (up_reg_id, up_name, up_planter, up_tree_name, up_group_id, up_file ) VALUES(?, ?, ?, ?, ?, ?)',[userId,
                    name,
                    planterName,
                    treeName,
                    groupId,
                    generatedImageName    
                ])
                res.status(200).json({
                    uploadsId : insertId,
                    success : true
                })
            } catch (error) {
                res.status(500).json({
                    message : "SQL Query Execution Failed | Can't insert uploads",
                    success : false,
                    error : error.message
                })
            }
        } else {
            res.state(422).json({
                message : "Unprocessable Entity",
                success : false,
                error : result.error.message
            })
        }
    } else {
        res.status(400).json({
            message : "Unprocessable Image file",
            success : false,
            error : resultImage.error.message
        })
    }
    
});


module.exports = router;