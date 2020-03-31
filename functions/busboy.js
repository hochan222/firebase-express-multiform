const express = require("express");
const router = express.Router();

const Busboy = require("busboy");
const path = require("path");
const fs = require("fs");

const firebaseAdmin = require("./admin/firebase").firebaseStorage();
const admin = require("firebase-admin");

router.get("/upload", (req, res, next) => {
  res.render("upload");
  console.log("upload page with busboy");
  return;
});

// https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
router.post("/photo", function(req, res, next) {
  const busboy = new Busboy({ headers: req.headers });
  
  let uploads = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    //const filepath = path.join(os.tmpdir(), filename);
    const filepath = path.join(__dirname, 'uploads/', filename);
    const imageTobeUploaded = { filepath, mimetype };
    uploads[filename] = { file: filepath };
    
    console.log(`File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);
    console.log(`Saving '${filename}' to ${filepath}`);
    file.pipe(fs.createWriteStream(filepath));
    // firebase storage에 저장
    admin
      .storage()
      .bucket()
      .upload(imageTobeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageTobeUploaded.mimeType
          }
        }
    })
    .catch(err => {
      console.error(err);
      return res.status(400).json({ error: err.code });
    });

    fs.unlink(filepath, function(error){
      console.log(error)
    })
  });

  busboy.on("finish", () => {
    return res.render("photo");
  });
  busboy.end(req.rawBody);
});

router.get("/download", function(req, res, next) {
  const imgName = req.query.imgName;
  console.log(req.originalUrl)
  const file = firebaseAdmin
    .storage()
    .bucket()
    .file(imgName);

  return file.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  }).then(signedUrls => {
    // signedUrls[0] contains the file's public URL
    return (res.json({ image: signedUrls }));
  });

  // const config = { action: "read", expires: "04-20-2030" };
  // file.getSignedUrl(config, (err, url) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log(url);
  //   res.render("download", { image: url });
  //   return;
  // });
});

module.exports = router;
