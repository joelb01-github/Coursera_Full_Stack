const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

// Configuring multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //cb = callback taking 1st arg as error and 2nd where to put file
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    // filename specific name to be used on the uploaded file
    // here choosing to keep name from client side when uploaded
    cb(null, file.originalname)
  }
});
// File filter on what can be uploaded
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can only upload image files!'), false);
  }
  cb(null, true);
};
// Setting up the options
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('GET operation not supported on /imageUpload');
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /imageUpload');
})
.post(authenticate.verifyUser,
  authenticate.verifyAdmin,
  upload.single('imageFile'),
  (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
});

module.exports = uploadRouter;
