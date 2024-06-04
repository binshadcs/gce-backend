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

module.exports = {
    CreateGroup,
    CreateNGO,
    CoordinatorLogin,
    CoordinatorSpecific
}