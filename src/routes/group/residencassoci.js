const { Router } = require('express')
const { CreateNGO, CreateSchool, CreatePromoter, CreateResidence } = require('../../types')
const { Db } = require('../../config/db')
const router = Router()

router.get('/all', (req, res)=> {
    res.status(200).json({
        message : "group!! ngo"
    })
}) 

router.post('/register', async(req, res) => {
    const { groupId,
        countryId,
        stateId,
        districtId,
        lsgdId,
        totalNoOfMembers,
        city,
        province
        } = req.body;
    const result = CreateResidence.safeParse({ groupId,
        countryId,
        stateId,
        districtId,
        lsgdId,
        totalNoOfMembers,
        city,
        province 
    })
    if(result.success) {
        try {
            const [{insertId}] = await Db.promise().query('INSERT INTO tbl_residence_association (group_id, no_of_members, country_id, state_id, district_id, lsgd_id, city, province) VALUES(?,?,?,?,?,?, ?, ?)',
                 [groupId,
                totalNoOfMembers,
                countryId,
                stateId,
                districtId,
                lsgdId,
                city,
                province
            ])
            
            res.status(200).json({
                residenceAssociationId : insertId
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