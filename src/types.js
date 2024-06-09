const zod = require('zod');

// Coordinators 
const CreateGroup = zod.object({
    categoryId : zod.string(),
    name : zod.string(),
    location : zod.string(),
    coordinator_name : zod.string(),
    whatsapp_number : zod.string(),
    profession : zod.string(),
    country : zod.string(),
    state : zod.number().optional(),
    district : zod.number().optional(),
    lsg : zod.number().optional(),
    city : zod.string().optional(),
    province : zod.string().optional(),
    username : zod.string(),
    password : zod.string().min(8)
})

const CoordinatorLogin = zod.object({
    username : zod.string(),
    password : zod.string()
})

const CoordinatorSpecific = zod.number()

// NGO
const CreateNGO = zod.object({
    groupId : zod.number(),
    members : zod.number()
})

// School
const CreateSchool = zod.object({
    groupId : zod.number(),
    clubs : zod.string(),
    list_of_classes : zod.string() ,
    no_of_students : zod.number(),
    phoneNUmber : zod.number()
    
})

// promoter 
const CreatePromoter = zod.object({
    groupId : zod.number(),
    cityName : zod.string(),
    countryId : zod.number().optional(),
    stateId : zod.number().optional(),
    districtId : zod.number().optional(),
    lsgdId : zod.number().optional(),
    city : zod.string().optional(),
    province : zod.string().optional(),
    totalNoOfMembers : zod.number(),
    categoryIdPromoting : zod.number()
})

// Residence associates
const CreateResidence = zod.object({
    groupId : zod.number(),
    countryId : zod.number().optional(),
    stateId : zod.number().optional(),
    districtId : zod.number().optional(),
    lsgdId : zod.number().optional(),
    city : zod.string().optional(),
    province : zod.string().optional(),
    totalNoOfMembers : zod.number()
})

// User
const CreateUser = zod.object({
    groupId : zod.number(),
    name : zod.string(),
    email : zod.string().email().optional(),
    profileDescription : zod.string().optional(),
    mobileNumber : zod.string(),
    countryId : zod.number(),
    stateId : zod.string().optional(),
    city : zod.string().optional(),
    province : zod.string().optional(),
    address : zod.string(),
    gender : zod.string(),
    password : zod.string(),
    referalCode : zod.string().optional()
})

const LoginUser = zod.object({
    phoneNumber : zod.number(),
    password : zod.string()
})

const CreateUploads = zod.object({
    userId : zod.number(),
    name : zod.string(),
    planterName : zod.string(),
    treeName : zod.string(),
    groupId : zod.number()
})

const CreateActivity = zod.object({
    userId : zod.number(),
    category : zod.number(),
    subCategory : zod.string(),
    name : zod.string(),
    address : zod.string(),
    activityTitle : zod.string(),
    socialMediaLink : zod.string()
})


const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes
const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ImageFileValidate = zod.object({
    type: zod.enum(validMimeTypes, {
        invalid_type_error: 'Invalid file type. Only jpeg, jpg, png, and webp are allowed.',
    }), 
    size: zod.number().max(maxFileSize, {
    message: 'File size must be less than or equal to 5 MB.',
    })
});

module.exports = {
    CreateGroup,
    CreateNGO,
    CoordinatorLogin,
    CoordinatorSpecific,
    CreateSchool,
    CreatePromoter,
    CreateResidence,
    CreateUser,
    LoginUser,
    CreateUploads,
    CreateActivity,
    ImageFileValidate
}