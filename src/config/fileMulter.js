const multer = require('multer');

const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, './images/');
    },
    filename : function(req, file, cb) {
        cb(null, new Date().toISOString()+file.originalname) // new Date().toISOString()+file.filename
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file by , cb(null, false)
    // accept file by, cb(null, true)
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === "image/webp" ) {
        cb(null, true);
    } else {
        cb(null, false)
    }
};

const uploadMulter = multer({
    storage: storage, 
    limits : {
        fileSize : 1024 * 1024 * 5
    },
    fileFilter : fileFilter
});



module.exports = { uploadMulter }