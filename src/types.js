const zod = require('zod');

// Coordinators 
const CreateGroup = zod.object({
    categoryId : zod.number(),
    name : zod.string(),
    location : zod.string(),
    coordinator_name : zod.string(),
    whatsapp_number : zod.number(),
    profession : zod.string(),
    country : zod.number(),
    state : zod.number(),
    district : zod.number(),
    lsg : zod.number(),
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
    countryId : zod.number(),
    stateId : zod.number(),
    districtId : zod.number(),
    lsgdId : zod.number(),
    totalNoOfMembers : zod.number(),
    categoryIdPromoting : zod.number()
})

// Residence associates
const CreateResidence = zod.object({
    groupId : zod.number(),
    countryId : zod.number(),
    stateId : zod.number(),
    districtId : zod.number(),
    lsgdId : zod.number(),
    totalNoOfMembers : zod.number()
})

// User
const CreateUser = zod.object({
    groupId : zod.number(),
    name : zod.string(),
    email : zod.string().email(),
    userPhoto: zod.string().optional(),
    profileDescription : zod.string().optional(),
    mobileNumber : zod.number(),
    countryId : zod.number(),
    stateId : zod.number(),
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
    image : zod.string().optional(),
    groupId : zod.number()
})

const CreateActivity = zod.object({
    userId : zod.number(),
    category : zod.number(),
    subCategory : zod.string(),
    name : zod.string(),
    address : zod.string(),
    activityTitle : zod.string(),
    socialMediaLink : zod.string(),
    activityThumbnail : zod.string()
})


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
    CreateActivity
}