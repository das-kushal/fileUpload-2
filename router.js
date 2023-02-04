const express = require('express');
const router = express.Router();
const fs = require('fs');
const passport = require('passport');
const intiializePassport = require('./config/passport');
const { isAuth } = require('./config/auth');
const Client = require('./models/client');
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

router.use(passport.initialize());
router.use(passport.session());

intiializePassport(passport);

// home route
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login Page' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register Page' });
});


router.get('/dashboard', isAuth, async (req, res) => {
    res.render('dashboard', { title: 'Dashboard Page' });
});


router.post("/register", async (req, res) => {
    try {
        const folder = req.body.name;
        const newClient = new Client({
            name: req.body.name,
            password: req.body.password,
            folder: folder
        });
        const folderPath = __dirname + '/uploads/' + folder;
        await fs.promises.mkdir(folderPath);
        const _client = await newClient.save();
        console.log(_client);
        res.render('successMessage', { title: 'Success Page', message: 'Client registered successfully', redirectUrl: '/login' })
    } catch (err) {
        res.render('errorMessage', { error: err })
    }
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/login-success' }));


router.get('/login-success', isAuth, (req, res) => {
    res.render('successMessage', { title: "Login-Success", message: 'Logged-in Successfully!', redirectUrl: '/dashboard' });
});

router.get('/login-failure', isAuth, (req, res) => {
    res.render('errorMessage', { title: "Unsuccessful Login", error: "Incorrect Username/Password" });
});


router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        // const client = Client.findById(req.session.passport.user);
        // console.log('CLIENT** ', client);
        res.redirect('/dashboard');
    }
    res.render('index', { title: 'Index Page' });

});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err)
        }
        res.render('successMessage', { title: 'Logout Page', message: 'Logged out successfully', redirectUrl: '/' })
    });
})


const storageManager = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/manager');
    },
    filename: function (req, file, cb) {
        cb(null, `${uuid()}-${file.originalname}`);
    }
})
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const client = await Client.findById(req.session.passport.user);
        cb(null, __dirname + '/uploads/' + client.folder);
    },
    filename: function (req, file, cb) {
        cb(null, `${uuid()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });
const uploadManager = multer({ storage: storageManager });
function fileUpload(req, res, next) {
    uploadManager.single('myfile')(req, res, next);
    upload.single('myfile')(req, res, next);
    next();
}
router.post("/upload", fileUpload, async (req, res) => {
    const client = await Client.findById(req.session.passport.user);
    console.log(client);
    if (!client) {
        res.render('errorMessage', { title: 'User Not Found', error: 'No user with that name' })
    }
    console.log('File is uploaded');
    res.render('successMessage', { title: 'Uploaded SuccessFully', message: 'File uploaded successfully', redirectUrl: '/dashboard' })
}


)


router.get('/files', async (req, res) => {
    const client = await Client.findById(req.session.passport.user);
    var fileList = [];
    console.log(client);

    const files = await fs.promises.readdir(__dirname + '/uploads/' + client.folder);
    fileList = files.map((file) => {
        return {
            name: file,
            path: `/preview/${client.folder}/${file}`,
        };
    });
    res.json(fileList);
})


router.get('/preview/:dir/:file', async (req, res) => {
    const client = await Client.findById(req.session.passport.user);
    const file = req.params.file;
    console.log(file);
    const filePath = path.join(__dirname, `uploads/${client.folder}`, file);
    res.sendFile(filePath);
});

router.get('/download/:file', async (req, res) => {
    const client = await Client.findById(req.session.passport.user);
    const file = req.params.file;
    const filePath = path.join(__dirname, `uploads/${client.folder}`, file);
    res.download(filePath);
});




module.exports = router;