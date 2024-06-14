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

const router = Router()

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "coordinator!!"
    })
}); 

router.get('/all', async(req, res)=> {
    try {
        const [coordinators] = await Db.promise().query('select * from tbl_group_coordinators')
        // console.log(coordinators)
        if(coordinators.length > 0) {
            res.status(404).json({
                coordinators
            })
            
        } else {
            res.status(200).json({
                message : "coordinators not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message : "can't fetch coordinators"
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
            corporation
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
        corporation
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
                    [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_code (gp_name, gp_code, gp_cat_id, dis_id, lsg_id, gp_coord_id, gp_location, gp_country_id, gp_state_id, gp_city, gp_province, cop_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[name,
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
                        corporation
                        ])
                    const group_id = insertId;
                    try {
                        [{insertId}] = await Db.promise().query('UPDATE tbl_group_coordinators SET gp_id = ? WHERE co_ord_id = ?',[group_id, group_coordinator_id]); 
                        res.status(200).json({
                            group_id,
                            coordinator_id : group_coordinator_id
                        })
                    } catch (error) {
                        console.log(error)
                        res.status(404).json({
                            message : "can't insert data"
                        })
                    }  
    
                } catch (error) {
                    console.log(error)
                    res.status(404).json({
                        message : "can't insert data"
                    })
                } 
            } catch (error) {
                // console.log(error)
                // console.log(error)
                res.status(404).json({
                    message : "can't insert data"
                })
            } 
        } else {
            // console.log(result.error.message)
            // console.log(resultImage.error.message)
            res.status(400).json({
                message : "Invalid input"
            })
        }
     } else {
        // What if user don't have an image
        const defaultImage = 'profile.png'
        if(result.success) {
            const hashedPassword = await hashPassword(password)
            try {
                // await s3.send(command);
                let [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_coordinators (gp_id, co_ord_name, co_ord_contact, co_profession, co_username, co_password,co_ord_photo ) VALUES(?, ?, ?, ?, ?, ?, ?)',[-1,
                    coordinator_name,
                    whatsapp_number,
                    profession,
                    username,
                    hashedPassword,
                    defaultImage
                ])
                // console.log(test)
                const group_coordinator_id = insertId;
                try {
                    [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_code (gp_name, gp_code, gp_cat_id, dis_id, lsg_id, gp_coord_id, gp_location, gp_country_id, gp_state_id, gp_city, gp_province,, corporation) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[name,
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
                        corporation
                        ])
                    const group_id = insertId;
                    try {
                        [{insertId}] = await Db.promise().query('UPDATE tbl_group_coordinators SET gp_id = ? WHERE co_ord_id = ?',[group_id, group_coordinator_id]); 
                        res.status(200).json({
                            group_id,
                            coordinator_id : group_coordinator_id
                        })
                    } catch (error) {
                        console.log(error)
                        res.status(404).json({
                            message : "can't insert data"
                        })
                    }  
    
                } catch (error) {
                    console.log(error)
                    res.status(404).json({
                        message : "can't insert data"
                    })
                } 
            } catch (error) {
                // console.log(error)
                // console.log(error)
                res.status(404).json({
                    message : "can't insert data"
                })
            } 
        } else {
            // console.log(result.error.message)
            // console.log(resultImage.error.message)
            res.status(400).json({
                message : "Invalid input"
            })
        } 
     }
    
});

router.post('/login', async(req, res)=> {
    const { username, password } = req.body;
    // console.log(req.body)
    const result = CoordinatorLogin.safeParse({username, password});
    // const hashedPassword = await hashPassword(password)
    // console.log(hashedPassword)
    if(result.success) {
        try {
            let [value] = await Db.promise().query('SELECT co_username, co_ord_id, gp_id, co_password FROM tbl_group_coordinators where co_username = ?',[username]);
            console.log(value)
            if(value.length !== 0) {
                const hashing = await comparePassword(password, value[0].co_password)
                // console.log(hashing)
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
                        }
                    })
                } else {
                    res.status(400).json({
                        message : "Incorrect password"
                    })
                }
            } else {
                res.status(404).json({
                    message : "User not found"
                })
            }
        } catch (error) {
            console.log(error)
            res.status(404).json({
                message : "Can't fecth data"
            })
        }
    } else {
        res.status(400).json({
            message : "Invalid data"
        })
    }
});

router.post('/:id', coordinatorAuth, async(req, res)=> {
    const coordinator_id = req.params.id;
    // const result = CoordinatorSpecific.safeParse( "tss" )
    // console.log(result)
    try {
        const [coordinator] = await Db.promise().query('SELECT co_ord_id, gp_id, co_ord_name, co_ord_contact, co_profession, co_refferel_code  from tbl_group_coordinators where co_ord_id = ?',[coordinator_id]);
        console.log(coordinator)
        if(coordinator.length > 0) {
            res.status(404).json({
                coordinator
            })
        } else {
            res.status(400).json({
                message : "Coordinator not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message : "can't fetch Coordinator"
        })
    } 
})

module.exports = router;