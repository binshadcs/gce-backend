const { Router } = require('express')
const { Db } = require('../../config/db')
const { userAuth } = require('../../middleware/user');
const { CreateActivity, ImageFileValidate } = require('../../types');
const { uploadMulter } = require('../../config/fileMulter');
const sharp = require('sharp');
const { randomImageName } = require('../util');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { bucketName, s3 } = require('../../config/bucket');
const { compareSync } = require('bcrypt');
const router = Router()

router.get('/all', userAuth, async(req, res)=> {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const [activity] = await Db.promise().query('SELECT personal_activity_id,login_id, participant_name,activity_category_id, activity_title, activity_description, activity_social_media_link, activity_thumbnail,activity_likes, activity_views, activity_value,activity_on  FROM tbl_personal_activities order by activity_on DESC limit ? offset ?', [limit, offset])
        if(activity.length > 0) {
            res.status(200).json({
                activity,
                success : true
            })
        } else {
            res.status(204).json({
                message : "Activity not found",
                success : false
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "SQL Query Execution Failed | Can't fetch activity",
            success : false,
            error : error.message
        })
    } 
});

router.post("/new", userAuth, uploadMulter.single('activityThumbnail'), async(req, res) => {
    const { name, category, subCategory, address, activityTitle, socialMediaLink } = req.body;
    const userId = req.userId;
    if(req.file !== undefined) {
        const type = req.file.mimetype;
        const size = req.file.size;
        const resultImage = ImageFileValidate.safeParse({type, size})
        const result = CreateActivity.safeParse({userId, name, category : parseInt(category), subCategory, address, activityTitle, socialMediaLink})
        const buffer = await sharp(req.file.buffer).resize(1000).toBuffer()
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
                let [{insertId}] = await Db.promise().query('INSERT INTO tbl_personal_activities (login_id,participant_name, activity_category_id, activity_sub_category, participant_address, activity_title, activity_social_media_link, activity_thumbnail ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',[userId,
                    name,
                    category,
                    subCategory,
                    address,
                    activityTitle,
                    socialMediaLink,
                    generatedImageName   
                ])
                res.status(201).json({
                    activityId : insertId,
                    success : true
                })
            } catch (error) {
                res.status(500).json({
                    message : "SQL Query Execution Failed | Can't insert activity",
                    success : false,
                    error : error.message
                })
            }
        } else {
            console.log(result.error.message)
            res.status(422).json({
                message : "Unprocessable Entity",
                success : false,
                error : result.error.message
            })
        } 
    } else {
        res.status(422).json({
            message : "Unprocessable photo",
            success : false
        }) 
    }
})

router.get('/:id', userAuth, async(req, res)=> {
    const userId = req.params.id;
    const userIdByToken = req.userId;
    if(userId != userIdByToken) {
        return res.status(403).json({
            message : `You do not have permission to access this user id ${userId}`,
            success : false
        })
    }
    try {
        const [activity] = await Db.promise().query('SELECT personal_activity_id, participant_name,activity_category_id, activity_title, activity_description, activity_social_media_link, activity_thumbnail,activity_likes, activity_views, activity_value,activity_on  FROM tbl_personal_activities where login_id = ? order by activity_on DESC', [userId])
        if(activity.length !== 0) {
            res.status(200).json({
                activity,
                success : true
            })
        } else {
            res.status(204).json({
                message : `activity not found for user id ${userId}`,
                success : false
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "SQL Query Execution Failed | Can't fetch activity",
            error : error.message,
            success : false
        })
    } 
});

module.exports = router;