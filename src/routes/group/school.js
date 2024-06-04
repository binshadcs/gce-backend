const { Router } = require('express')
const { CreateNGO, CreateSchool } = require('../../types')
const { Db } = require('../../config/db')
const router = Router()

router.get('/all', (req, res)=> {
    res.status(200).json({
        message : "group!! ngo"
    })
}) 

router.post('/register', async(req, res) => {
    const { groupId,
            clubs,
            list_of_classes,
            no_of_students,
            phoneNUmber
        } = req.body;
    const result = CreateSchool.safeParse({ groupId, clubs, list_of_classes, no_of_students, phoneNUmber })
    if(result.success) {
        try {
            const [value] = await Db.promise().query('SELECT dis_id FROM tbl_group_code WHERE gp_id = ?', [groupId])
            if(value.length > 0) {
                const district_id = value[0].dis_id
                console.log(district_id)
                try {
                const [{insertId}] = await Db.promise().query('INSERT INTO tbl_school (group_id, clubs, edu_district, edu_sub_district, no_of_students, list_of_classes, phone_number) VALUES(?,?,?,?,?,?, ?)', [groupId, clubs, district_id, district_id, no_of_students, list_of_classes, phoneNUmber])
                
                res.status(200).json({
                    schoolId : insertId
                })
            } catch (error) {
                res.status(404).json({
                    message : "can't insert data"
                })
            } 
            } else {
                res.status(400).json({ message  : "Group not found"})
            }
            
        } catch (error) {
            res.status(404).json({
                message : "can't fetch data"
            })
        } 
    } else {
        res.status(400).json({
            message : "invalid input"
        })
    }
}) 

module.exports = router;