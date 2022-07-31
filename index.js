const cors = require("cors");
const express = require("express");
const app = express();
const db = require("./db.json");
var jwt = require('jsonwebtoken');
const fs = require("fs");


app.use(express.json());
app.use(cors());

app.get("/", (req,res,next)=> {
    res.send("Hello World");
})


app.post("/login", (req,res,next)=> {
    if(!req.body.email || !req.body.password){
        return res.status(400).send({
            success: "false",
            error:"Please provide email and password"
        });
    }
    if(req.body.email === db.auth.email && req.body.password === db.auth.password){
        var token = jwt.sign({ uid: db.auth.uid, email: db.auth.email }, "supersecretkey");
        res.status(200).send({
            success: true,
            token: token
        })
    } else {
        res.status(401).send({
            success: false,
            error: "Invalid Credentials"
        })
    }

});

const checkAuth = ((req,res,next)=> {
    if(!req.headers.authorization){
        res.status(401).send({
            success: false,
            error: "Unauthorized"
        })
    } else {
        jwt.verify(req.headers.authorization, 'supersecretkey', function(err, decoded) {
            if(err){
                res.status(401).send({
                    success: false,
                    error: "Unauthorized"
                })
            } else {
                next();
            }
          });
    }
})


app.get("/themes",checkAuth, (req,res,next)=> {
    res.send({
        success: true,
        themes: db.themes
    })
})

app.get("/settings",checkAuth, (req,res,next)=> {
    res.send({
        success: true,
        settings: {
            current_theme: db.current_theme,
        current_color: db.current_color,
        bubble_delay: db.bubble_delay
        }
    })
})

app.post("/set-theme", checkAuth, async(req,res,next)=> {
    if(!req.body.theme){
        return res.status(400).send({
            success: false,
            error: "Theme not found"
        })
    }
    db.current_theme = req.body.theme;
    db.current_color = req.body.color;
    db.bubble_delay = req.body.delay;
    if(req.body.theme === "custom"){
        db.themes.custom.color1 = req.body.color1,
        db.themes.custom.color2 = req.body.color2
    }
    await fs.writeFileSync('./db.json', JSON.stringify(db));
    res.send({
        success: true,
        settings: {
            current_theme: db.current_theme,
        current_color: db.current_color,
        bubble_delay: db.bubble_delay
        }
    })
})


app.listen(process.env.PORT || 3002, ()=> {
    console.log("Server is running on port 3000");
});
