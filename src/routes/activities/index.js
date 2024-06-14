const { Router } = require('express')
const { Db } = require('../../config/db')
const { userAuth } = require('../../middleware/user');
const { CreateActivity, ImageFileValidate } = require('../../types');
const { uploadMulter } = require('../../config/fileMulter');
const sharp = require('sharp');
const { randomImageName } = require('../util');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { bucketName, s3 } = require('../../config/bucket');
const router = Router()

router.get('/all', userAuth, async(req, res)=> {
    try {
        const [activity] = await Db.promise().query('SELECT personal_activity_id,login_id, participant_name,activity_category_id, activity_title, activity_description, activity_social_media_link, activity_thumbnail,activity_likes, activity_views, activity_value,activity_on  FROM tbl_personal_activities')
        if(activity.length > 0) {
            res.status(200).json({
                activity
            })
        } else {
            res.status(203).json({
                message : "activity not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch activity"
        })
    } 
});

router.post("/new", userAuth, uploadMulter.single('activityThumbnail'), async(req, res) => {
    const { name, category, subCategory, address, activityTitle, socialMediaLink } = req.body;
    const userId = req.userId;
    // activityThumbnail
    if(req.file !== undefined) {
        const type = req.file.mimetype;
        const size = req.file.size;
        const resultImage = ImageFileValidate.safeParse({type, size})
        const result = CreateActivity.safeParse({userId, name, category, subCategory, address, activityTitle, socialMediaLink})
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
                res.status(200).json({
                    activityId : insertId
                })
            } catch (error) {
                console.log(error)
                res.status(400).json({
                    message : "can't insert activity"
                })
            }
        } else {
            console.log(result.error.message)
            res.status(403).json({
                message : "Invalid data"
            })
        } 
    } else {
        res.status(400).json({
            message : "Please upload photo"
        }) 
    }
})

router.get('/:id', userAuth, async(req, res)=> {
    const userId = req.params.id;
    const userIdByToken = req.userId;
    if(userId != userIdByToken) {
        return res.status(203).json({
            message : `You do not have permission to access this user id ${userId}`
        })
    }
    try {
        const [activity] = await Db.promise().query('SELECT personal_activity_id, participant_name,activity_category_id, activity_title, activity_description, activity_social_media_link, activity_thumbnail,activity_likes, activity_views, activity_value,activity_on  FROM tbl_personal_activities where login_id = ?', [userId])
        if(activity.length !== 0) {
            res.status(200).json({
                activity,
                success : true
            })
        } else {
            res.status(203).json({
                message : `activity not found for user id ${userId}`,
                success : false
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch activity",
            error : error.message,
            success : false
        })
    } 
});

module.exports = router;