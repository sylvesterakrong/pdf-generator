const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Set up multer for file uploads
const storage = multer.diskStorage({
  //stores the images in the public/images directory
  destination: (req, file, cb) => {
    cb(null,'public/images')
  },
  //sets the filename to the current timestamp + the original name
  filename: (req, file,cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
  }
})

//config for file filtering
const fileFilter = (req, file, cb) => {
  // accept images only
  const ext = path.extname(file.originalname);
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
    return cb(new Error('Only .jpg, .jpeg and .png format allowed!'));
  } else {
    return cb(null, true)
  }
}

//initialize multer with the storage and fileFilter options
const upload = multer({ storage, fileFilter: fileFilter });

router.post('/upload', upload.array('images'), (req, res) => {
  console.log('Files received:', req.files);
  const files = req.files; 
  const imgNames = []; 

  // Loop through the files and get the names
  for(const file of files){
    imgNames.push(file.filename);  
  }
 
  // store the names in the session
  req.session.imagefiles = imgNames; 

  // send the names back to the client 
  res.redirect('/'); 

})

router.post('/pdf', (req, res, next) => {
  let body = req.body;

  //create a new pdf document
  let doc = new PDFDocument({sizw: 'A4', autoFirstPage: false});
  let pdfName = 'pdf-' + Date.now() + '.pdf'; 


  //store the pdf in the public/pdf directory
  doc.pipe(fs.createWriteStream(path.join(__dirname, '..', `public/pdf/${pdfName}`)));

  //add a new page to the pdf  
  for(let name of body){
    doc.addPage()
    doc.image(path.join(__dirname, '..', `/public/images/${name}`), 20, 20,   {width:555.28, align: 'center', valign: 'center'}); 
  }
 
   // Finalize the PDF
   doc.end();
  
   // Send the PDF URL to the client after the PDF is created
     res.send(`/pdf/${pdfName}`);
})
 
/* user sends a GET request to the root URL */
// and the server responds with the index.html file
router.get('/', (req, res, next)  => {
  //if there are no image filenames in a session, return to the html page
  if (req.session.imagefiles === undefined) {
    res.sendFile(path.join(__dirname, '..', 'public/html/index.html'));
  } else {
    //if there are image filenames in a session, return the index.jade(images)
    res.render('index', {images: req.session.imagefiles});
  }
});

module.exports = router;
