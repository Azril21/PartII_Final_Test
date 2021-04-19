const { User, Message } = require('../models/models.js')
const jwt = require('jsonwebtoken')
const { Router } = require('express')
const router = Router()


router.get('/', async function (req, res){
    let messages = await Message.findAll({})
    let data = { messages }

    res.render('index.ejs', data)
})

router.get('/createUser', async function(req, res){
    res.render('createUser.ejs')
})

router.post('/createUser', async function(req, res){
    let { username, password } = req.body

    try {
        await User.create({
            username,
            password,
            role: "user"
        })  
    } catch (e) {
        console.log(e)
    }

    res.redirect('/login')
})

router.get('/login', function(req, res) {
    res.render('login')
})


router.post('/login', async function(req, res) {
    let {username, password} = req.body

// The 'BUG' was in the login route.
// The user cannot login after entering the Username & password.

// the try statement is executed
// to catch any errors about the user's credentials (password and username).
    try {
        let user = await User.findOne({
            where: {username},
        
        })

        // the if statement is executed to check if
        // the password entered by the user matches.
        // if it matches, then the user is redirected to the createUser.ejs page.
        if (user && user.password === password) {
            let data = {
                username: username,
                role: user.role,
            };
            
            //JSOn Web Tokens encrypts the characters
            // encrypts and stores them as strings in a cookie
            //when the user closes the browser or logs out
            //the sessions end and the user is redired to the index page ('/').
            let token = jwt.sign(data, "theSecret")
            res.cookie("token", token)
            res.redirect('/')

            //if the password or username is not matched, the page is redirected 
            // to the error.ejs file 
            // where the error message is printed out to the user.
        } else {
            res.redirect('/error')
        }

        //if an error is catched it console logs (Prints out) the error.
    } catch (e) {
        console.log(e)
        
    }
    
})

router.get('/message', async function (req, res) {
    let token = req.cookies.token 

    if (token) {                                      // very bad, no verify, don't do this
        res.render('message')
    } else {
        res.render('login')
    }
})

router.post('/message', async function(req, res){
    let { token } = req.cookies
    let { content } = req.body

    if (token) {
        let payload = await jwt.verify(token, "theSecret")  
 
        let user = await User.findOne({
            where: {username: payload.username}
        })

        let msg = await Message.create({
            content,
            userId: user.id
        })

        res.redirect('/')
    } else {
        res.redirect('/login')
    }
})

router.get('/error', function(req, res){
    res.render('error')
})

router.all('*', function(req, res){
    res.send('404 dude')
})

module.exports = router