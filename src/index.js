const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mainRouter = require('./routes/index.js');
const { Db } = require('./config/db.js');

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    credentials : true,
    origin : ["http://localhost:3000", "http://localhost:5173", "https://green-clean-earth.vercel.app/"]
}));
app.use("/api/v1", mainRouter);

app.get("/status", (req, res) => {
    Db.connect(function(err) {
        if(err) {
            console.log(err)
            res.status(404).json({
                message : "Database not connected"
            })
        } else {
            res.status(200).json({ msg : "server is up" });
        }
    Db.end()
    })
	
});

app.use(function(req, res, next) {
	res.status(404).json({
		msg : "page not found"
	})
})

app.use(function(err, req, res, next) {
    console.log(err)
	res.status(500).json({
		msg : "server crash!!"
	})
})
app.listen(3000, ()=> {
	console.log("Server is running at port 3000");
})