const functions = require('firebase-functions');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const express = require('express');
const app = express();
const cors = require('cors')({origin: true});
const multipart = require("parse-multipart");
// const multer = require("multer");
// const formidable = require('formidable')
const formidable = require("express-formidable");
const formData = require("express-form-data");
const os = require("os");
const path = require('path'),
    fs = require('fs');

// firebase admin
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://busstore-dbb05.firebaseio.com"
});

app.use(cors);

// app.use(bodyParser.raw({
//     type: 'image/png',
//     limit: '10mb'
//   }));
  
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.raw());
// app.use(express.json())
// app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(express.urlencoded({extended: false}));

// app.use(formidable())
// const options = {
//     uploadDir: os.tmpdir(),
//     autoClean: true
//   };
// app.use(formData.parse(options));
// app.use(formData.stream());

app.get('/timestamp', (req, res) => {
    res.send(`${Date.now()}`);
});

app.get('/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
})

const multer = require('multer');
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({storage : _storage})

app.post('/send', upload.any(), (req, res) => {
    console.log(req.files)
    console.log(req.body)
    res.sendStatus(200);
  });
  

app.post('/busboy', (req, res, next)=> {
    const busboy = new Busboy({ headers: req.headers });

    // 데이터를 담을 placeholder
    var files = {};
    req.body = {};

    // 파일 처리
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        console.log(`File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);
        files[filename] = {
            filename,
            encoding,
            mimetype,
        };

        file.on("data", data => {
            console.log("File [" + fieldname + "] got " + data.length + " bytes");
            files[filename].buffer = Buffer.from(data);
        });

        var saveTo = path.join(__dirname, 'uploads/' + filename);
        file.pipe(fs.createWriteStream(saveTo));
    });

    // 필드 처리
    busboy.on("field", (fieldname, value) => {
        req.body[fieldname] = value;
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", () => {
        req.files = files;
        next();
    });

    // The raw bytes of the upload will be in req.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(req.rawBody);
    console.log(req.rawBody);
    // var buf = Buffer.from(JSON.stringify(req.rawBody), 'hex'); 
    // var temp = JSON.parse(buf.toString()); 

    var buf = Buffer.from(req.rawBody, 'hex'); 
    var temp = buf.toString();

    // console.log(temp)
})



app.post('/b', upload.single('image'), function(req, res, next) {    
    const image = req.rawBody 
    console.log(image) 
    return res.end()
  });

app.post('/a', (req, res) => {
    console.log(req.body)
    return res.end(req.body)
  });

app.post('/submit-form', (req, res) => {
    console.log(req.params)
    console.log(req.query)
    return res.end(req.body.toString());
  })

app.post('/userForm', (req, res) => {
    console.log(req.headers)
    console.log(req.body);

    res.json(req.body);
});

// app.post('/fileupload', function (req, res) {
//     const message = 'end';
//     // console.log("body", req.body.toString())
//     // console.log("rawbody", req.rawBody.toString())

//     console.log(req.files)



//     var busboy = new Busboy({ headers: req.headers });

//     busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//         message += 'File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype;
//     //   var saveTo = path.join(__dirname, 'uploads/' + filename);
//     //   file.pipe(fs.createWriteStream(saveTo));

//     //   var uploadTask = storageRef.child(`images/${fieldname}`).put(file);
//     //   uploadTask.on('state_changed', function(snapshot){
//     //       console.log(snapshot)
//     //     }, function(error) {
//     //         console.error("Something nasty happened", error);
//     //     }, function() {
//     //         var downloadURL = uploadTask.snapshot.downloadURL;
//     //         console.log("Done. Enjoy.", downloadURL);
//     //     });
//     });

//     // busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//     //     console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
//     //   var saveTo = path.join(__dirname, 'uploads/' + filename);
//     //   file.pipe(fs.createWriteStream(saveTo));

//     //   var uploadTask = storageRef.child(`images/${fieldname}`).put(file);
//     //   uploadTask.on('state_changed', function(snapshot){
//     //       console.log(snapshot)
//     //     }, function(error) {
//     //         console.error("Something nasty happened", error);
//     //     }, function() {
//     //         var downloadURL = uploadTask.snapshot.downloadURL;
//     //         console.log("Done. Enjoy.", downloadURL);
//     //     });
//     // });

//     // busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
//     //     console.log('Field [' + fieldname + ']: value: ' + inspect(val));
//     //   });

//     busboy.on('finish', function() {
//       res.writeHead(200, { 'Connection': 'close' });
//       res.end(message);
//     });
     
//     return req.pipe(busboy);    
// });

// app.listen(3000, () => console.log(`Example app listening on port 3000!`))
exports.app = functions.https.onRequest(app);
