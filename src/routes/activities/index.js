const { Router } = require('express')
const { Db } = require('../../config/db')
const { userAuth } = require('../../middleware/user');
const { CreateActivity } = require('../../types');
const router = Router()

router.get('/all', userAuth, async(req, res)=> {
    try {
        const [activity] = await Db.promise().query('SELECT personal_activity_id,login_id, participant_name,activity_category_id, activity_title, activity_description, activity_social_media_link, activity_thumbnail,activity_likes, activity_views, activity_value,activity_on  FROM tbl_personal_activities')
        if(activity.length > 0) {
            res.status(404).json({
                activity
            })
        } else {
            res.status(200).json({
                message : "activity not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch activity"
        })
    } 
});

router.post("/new", userAuth, async(req, res) => {
    const { name, category, subCategory, address, activityTitle, socialMediaLink,activityThumbnail } = req.body;
    const userId = req.userId;
    
    const result = CreateActivity.safeParse({userId, name, category, subCategory, address, activityTitle, socialMediaLink,activityThumbnail})
    if(result.success) {
        try {
            let [{insertId}] = await Db.promise().query('INSERT INTO tbl_personal_activities (login_id,participant_name, activity_category_id, activity_sub_category, participant_address, activity_title, activity_social_media_link, activity_thumbnail ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',[userId,
                name,
                category,
                subCategory,
                address,
                activityTitle,
                socialMediaLink,
                activityThumbnail   
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
        res.state(403).json({
            message : "Invalid data"
        })
    } 
})

module.exports = router;