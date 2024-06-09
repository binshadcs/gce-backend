const { Router } = require('express')
const { CreateNGO, CreateSchool, CreatePromoter } = require('../../types')
const { Db } = require('../../config/db')
const router = Router()

router.get('/all', (req, res)=> {
    res.status(200).json({
        message : "group!! ngo"
    })
}) 

router.post('/register', async(req, res) => {
    const { groupId,
        cityName,
        countryId,
        stateId,
        districtId,
        lsgdId,
        totalNoOfMembers,
        categoryIdPromoting,
        city,
        province
        } = req.body;
    const result = CreatePromoter.safeParse({ groupId,
        cityName,
        countryId,
        stateId,
        districtId,
        lsgdId,
        totalNoOfMembers,
        categoryIdPromoting,
        city,
        province })
    if(result.success) {
        try {
            const [{insertId}] = await Db.promise().query('INSERT INTO tbl_promoters (group_id, city_name, country_id, state_id, lsgd_id, total_members, category_id_promoting, city, province) VALUES(?,?,?,?,?,?, ?, ?, ?)', [groupId,
                cityName,
                countryId,
                stateId,
                districtId,
                lsgdId,
                totalNoOfMembers,
                categoryIdPromoting,
                city,
                province
            ])
            
            res.status(200).json({
                promotersId : insertId
            })
        } catch (error) {
            console.log(error)
            res.status(404).json({
                message : "can't insert data"
            })
        } 
    } else {
        res.status(400).json({
            message : "invalid input"
        })
    }
}) 

module.exports = router;