const { Router } = require('express')
const { Db } = require('../../config/db')
const { userAuth } = require('../../middleware/user')
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

router.post("/add", userAuth, (req, res) => {

})

module.exports = router;