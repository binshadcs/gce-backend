const { Router } = require('express');
const { CreateUser, LoginUser, ImageFileValidate } = require('../../types');
const { Db } = require('../../config/db');
const { JwtScret } = require('../../config/config');
const jwt = require('jsonwebtoken');
const { userAuth } = require('../../middleware/user');
const { coordinatorAuth } = require('../../middleware/coordinator');
const { uploadMulter } = require('../../config/fileMulter');
const sharp = require('sharp');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { randomImageName } = require('../util');
const { bucketName, s3 } = require('../../config/bucket');

const router = Router()

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "user!!"
    })
}) 

router.post('/:id/register',uploadMulter.single('userPhoto'), async(req, res)=> {
    const groupId = Number(req.params.id);
    console.log(groupId)
    const { 
        name,
        email,
        profileDescription,
        mobileNumber,
        countryId,
        stateId,
        address ,
        gender ,
        password,
        referalCode,
        city,
        province
     } = req.body;
     const result = CreateUser.safeParse({ groupId,
        name,
        email,
        // userPhoto,
        profileDescription,
        mobileNumber,
        countryId,
        stateId,
        address ,
        gender ,
        password,
        referalCode,
        city,
        province
});
    //  console.log(req.body)
     if(req.file !== undefined) {
        //  console.log(req.file)
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
        // console.log(result.error.message)
        if(result.success && resultImage.success) {
            try {
                await s3.send(command);
                let [{insertId}] = await Db.promise().query('INSERT INTO tbl_user (us_name, us_photo, us_profile_description, us_email, us_mobile, us_address, us_gender, us_password, us_role, us_cntry_id, us_state_id, us_grp_id, us_city, us_province) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[name,
                    generatedImageName,
                    profileDescription,
                    email,
                    mobileNumber,
                    address,
                    gender,
                    password,
                    1,
                    countryId,
                    stateId,
                    groupId,
                    city,
                    province
                ])
                res.status(200).json({
                    userId : insertId,
                    message : "user created successfully"
                })
            } catch (error) {
                console.log(error)
                res.status(404).json({
                    message : "can't insert user data"
                })
            } 
        } else {
            console.log(result.error.message)
            res.status(400).json({
                message : "Invalid data or image"
            })
    }
    } else {
        const defaultImage = 'profile.png'
        if(result.success) {
            try {
                let [{insertId}] = await Db.promise().query('INSERT INTO tbl_user (us_name, us_photo, us_profile_description, us_email, us_mobile, us_address, us_gender, us_password, us_role, us_cntry_id, us_state_id, us_grp_id, us_city, us_province) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[name,
                    defaultImage,
                    profileDescription,
                    email,
                    mobileNumber,
                    address,
                    gender,
                    password,
                    1,
                    countryId,
                    stateId,
                    groupId,
                    city,
                    province     
                ])
                res.status(200).json({
                    userId : insertId,
                    message : "user created successfully"
                })
            } catch (error) {
                console.log(error)
                res.status(404).json({
                    message : "can't insert user data"
                })
            } 
        } else {
            console.log(result.error.message)
            res.status(400).json({
                message : "Invalid data or image"
            })
    }
    }
    
});

router.post('/login', async(req, res)=> {
    const { phoneNumber, password } = req.body;
    const result = LoginUser.safeParse({phoneNumber, password});
    if(result.success) {
        try {
            let [[value]] = await Db.promise().query('SELECT us_id, us_role, us_grp_id FROM tbl_user where us_mobile = ? and us_password = ? ',[phoneNumber, password]);
            console.log(value)
            if(value !== undefined) {
                const token = jwt.sign({
                                id: value.us_id,
                                groupId : value.us_grp_id,
                                roleId : value.us_role
                            }, JwtScret);
                res.cookie("token", token);
                res.status(200).json({
                    message : "Logged in!",
                    data : {
                        id: value.us_id,
                        groupId : value.us_grp_id,
                        roleId : value.us_role,
                        token 
                    }
                })
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

router.get("/:id",userAuth, async(req, res) => {
    const userIdByToken = req.userId;
    const userId = req.params.id;
    if(userId == userIdByToken) {
        try {
            const [user] = await Db.promise().query('SELECT us_id, us_name, us_photo, us_profile_description, us_email, us_mobile, us_country, us_state, us_district, us_corporation, us_lsgd, us_ward, us_address, us_gender, us_cntry_id, us_state_id, us_grp_id FROM tbl_user WHERE us_id = ? ',[userId])
            if(user) {
                res.status(200).json({
                    user
                })
            } else {
                res.status(400).json({
                    message : "user not found"
                })
            }
        } catch (error) {
            res.status(404).json({
                message : "can't fetch user"
            })
        } 
    } else {
        res.status(400).json({
            message : "Try with logged in user"
        })
    }
    
})

router.get("/group/:id",coordinatorAuth, async(req, res) => {
    const groupId = req.params.id;
    const groupByToken = req.groupId;
    // console.log(groupByToken)
    if(groupByToken == groupId) {
        try {
            const [users] = await Db.promise().query('SELECT us_id, us_name, us_email, us_mobile FROM tbl_user WHERE us_grp_id = ?',[groupId])
            if(users.length !== 0) {
                res.status(200).json({
                    users
                })
            } else {
                res.status(400).json({
                    message : "users not found"
                })
            }
        } catch (error) {
            res.status(404).json({
                message : "can't fetch users"
            })
        }
    } else {
        res.status(400).json({
            message : "you can't access other group user data"
        })
    } 
})

module.exports = router;