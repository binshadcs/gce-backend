const { Router } = require('express');
const { Db } = require('../../config/db');
const { hashPassword, comparePassword, randomImageName } = require('../util');
const { CreateGroup, CoordinatorLogin, CoordinatorSpecific, ImageFileValidate } = require('../../types');
const jwt = require('jsonwebtoken');
const { JwtScret } = require('../../config/config');
const { coordinatorAuth } = require('../../middleware/coordinator');
const { uploadMulter } = require('../../config/fileMulter');
const sharp = require('sharp');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { bucketName, s3 } = require('../../config/bucket');
const { default: errorMap } = require('zod/locales/en.js');

const router = Router()

router.get('/all', async(req, res)=> {
    try {
        const [coordinators] = await Db.promise().query('select * from tbl_group_coordinators')
        if(coordinators.length != 0) {
            res.status(200).json({
                coordinators,
                success : true
            })
            
        } else {
            res.status(204).json({
                message : "coordinators not found",
                success : false
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message : "SQL Query Execution Failed | can't fetch coordinators",
            success : false,
            error : error.message
        })
    }
}) 

router.post('/register', uploadMulter.single('userPhoto'), async(req, res)=> {
    const { categoryId,
            name,
            location,
            coordinator_name,
            whatsapp_number,
            profession,
            country,
            state,
            district,
            lsg,
            username,
            password,
            city,
            province,
            corporation,
            wardNo
     } = req.body;
     const result = CreateGroup.safeParse({ categoryId,
        name,
        location,
        coordinator_name,
        whatsapp_number,
        profession,
        country,
        state,
        district,
        lsg,
        username,
        password,
        city,
        province,
        corporation,
        wardNo
    })
     if(req.file !== undefined) {
        const type = req.file.mimetype;
        const size = req.file.size;
        const resultImage = ImageFileValidate.safeParse({type, size})
        const buffer = await sharp(req.file.buffer).resize(600).toBuffer()
        let generatedImageName = randomImageName()
        const command = new PutObjectCommand({
            Bucket : bucketName,
            Key : generatedImageName,
            Body : buffer,
            ContentType : req.file.mimetype
        })
        if(result.success && resultImage.success) {
            const hashedPassword = await hashPassword(password)
            try {
                await s3.send(command);
                let [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_coordinators (gp_id, co_ord_name, co_ord_contact, co_profession, co_username, co_password,co_ord_photo ) VALUES(?, ?, ?, ?, ?, ?, ?)',[-1,
                    coordinator_name,
                    whatsapp_number,
                    profession,
                    username,
                    hashedPassword,
                    generatedImageName
                ])
                // console.log(test)
                const group_coordinator_id = insertId;
                try {
                    [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_code (gp_name, gp_code, gp_cat_id, dis_id, lsg_id, gp_coord_id, gp_location, gp_country_id, gp_state_id, gp_city, gp_province, cop_id, gp_ward_no ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[name,
                        name,
                        categoryId,
                        district,
                        lsg,
                        group_coordinator_id,
                        location,
                        country,
                        state,
                        city, 
                        province,
                        corporation,
                        wardNo
                        ])
                    const group_id = insertId;
                    try {
                        [{insertId}] = await Db.promise().query('UPDATE tbl_group_coordinators SET gp_id = ? WHERE co_ord_id = ?',[group_id, group_coordinator_id]); 
                        res.status(201).json({
                            group_id,
                            coordinator_id : group_coordinator_id,
                            success : true
                        })
                    } catch (error) {
                        res.status(500).json({
                            message : "SQL Query Execution Failed | can't insert data",
                            success : false,
                            error : error.message
                        })
                    }  
    
                } catch (error) {
                    res.status(500).json({
                        message : "SQL Query Execution Failed | Can't insert data",
                        success : false,
                        error : error.message
                    })
                } 
            } catch (error) {
                res.status(500).json({
                    message : "SQL Query Execution Failed | Can't insert data",
                    success : false,
                    error : error.message
                })
            } 
        } else {
            res.status(422).json({
                message : "Unprocessable Entity",
                success : false,
                error : result.error.message
            })
        }
     } else {
        const defaultImage = 'profile.png'
        if(result.success) {
            const hashedPassword = await hashPassword(password)
            try {
                let [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_coordinators (gp_id, co_ord_name, co_ord_contact, co_profession, co_username, co_password,co_ord_photo ) VALUES(?, ?, ?, ?, ?, ?, ?)',[-1,
                    coordinator_name,
                    whatsapp_number,
                    profession,
                    username,
                    hashedPassword,
                    defaultImage
                ])
                const group_coordinator_id = insertId;
                try {
                    [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_code (gp_name, gp_code, gp_cat_id, dis_id, lsg_id, gp_coord_id, gp_location, gp_country_id, gp_state_id, gp_city, gp_province, cop_id, gp_ward_no ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[name,
                        name,
                        categoryId,
                        district,
                        lsg,
                        group_coordinator_id,
                        location,
                        country,
                        state,
                        city,
                        province,
                        corporation,
                        wardNo
                        ])
                    const group_id = insertId;
                    try {
                        [{insertId}] = await Db.promise().query('UPDATE tbl_group_coordinators SET gp_id = ? WHERE co_ord_id = ?',[group_id, group_coordinator_id]); 
                        res.status(200).json({
                            group_id,
                            coordinator_id : group_coordinator_id,
                            success : true
                        })
                    } catch (error) {
                        res.status(500).json({
                            message : "SQL Query Execution Failed | Can't insert data",
                            success : false,
                            error : error.message
                        })
                    }  
    
                } catch (error) {
                    res.status(500).json({
                        message : "SQL Query Execution Failed | Can't insert data",
                        success : false,
                        error : error.message
                    })
                } 
            } catch (error) {
                res.status(500).json({
                    message : "SQL Query Execution Failed | Can't insert data",
                    success : false,
                    error : error.message
                })
            } 
        } else {
            res.status(422).json({
                message : "Unprocessable Image",
                success : false,
                error : resultImage.error.message
            })
        } 
     }
});

router.post('/login', async(req, res)=> {
    const { username, password } = req.body;
    const result = CoordinatorLogin.safeParse({username, password});
    if(result.success) {
        try {
            let [value] = await Db.promise().query('SELECT co_username, co_ord_id, gp_id, co_password FROM tbl_group_coordinators where co_username = ?',[username]);
            console.log(value)
            if(value.length !== 0) {
                const hashing = await comparePassword(password, value[0].co_password)
                if(hashing === true) {
                    const token = jwt.sign({
                                id: value[0].co_ord_id,
                                groupId : value[0].gp_id,
                                roleId : 2
                            }, JwtScret);
                    res.cookie("token", token);
                    res.status(200).json({
                        message : "Logged in!",
                        data : {
                            id: value[0].co_ord_id,
                            groupId : value[0].gp_id,
                            roleId : 2,
                            token 
                        },
                        success : true
                    })
                } else {
                    res.status(401).json({
                        message : "Incorrect password",
                        success : false
                    })
                }
            } else {
                res.status(401).json({
                    message : "User not found",
                    success : false
                })
            }
        } catch (error) {
            res.status(500).json({
                message : "SQL Query Execution Failed | Can't fecth data",
                success : false,
                error : error.message
            })
        }
    } else {
        res.status(422).json({
            message : "Unprocessable Entity",
            success : false,
            error : result.error.message
        })
    }
});

router.post('/:id', coordinatorAuth, async(req, res)=> {
    const coordinator_id = req.params.id;
    try {
        const [coordinator] = await Db.promise().query('SELECT co_ord_id, gp_id, co_ord_name, co_ord_contact, co_profession, co_refferel_code  from tbl_group_coordinators where co_ord_id = ?',[coordinator_id]);
        console.log(coordinator)
        if(coordinator.length != 0) {
            res.status(200).json({
                coordinator,
                success : true
            })
        } else {
            res.status(204).json({
                message : "Coordinator not found",
                success : false
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "SQL Query Execution Failed | Can't fetch Coordinator",
            success : false,
            error : error.message
        })
    } 
})

module.exports = router;