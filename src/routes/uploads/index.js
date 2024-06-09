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
            res.status(200).json({
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
                    uploadsId : insertId
                })
            } catch (error) {
                console.log(error)
                res.status(400).json({
                    message : "can't insert uploads"
                })
            }
        } else {
            res.state(403).json({
                message : "Invalid data"
            })
        }
    } else {
        res.status(400).json({
            message : "Please upload photo"
        })
    }
    
});

router.post('/test', uploadMulter.single('imageFile'), async(req, res) => {
    // console.log(req.file)
    
    if(req.file !== undefined) {
        const type = req.file.mimetype;
        const size = req.file.size;
        const result = ImageFileValidate.safeParse({type, size})
        const buffer = await sharp(req.file.buffer).resize(1000).toBuffer()
        const command = new PutObjectCommand({
            Bucket : bucketName,
            Key : randomImageName(),
            Body : buffer,
            ContentType : req.file.mimetype
        })
        if(result.success) {
            await s3.send(command);
            // s3.
            res.status(200).json({
                message : "test route workig......!"
            })
        } else {
            res.status(200).json({
                message : "Invalid data"
            })
        }
    } else {
        res.status(400).json({
            message : "Please upload photo"
        })
    }
    
})

module.exports = router;