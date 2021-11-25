const multer = require("multer");
const path = require('path')

const uploadFile = function (field_name, destination) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${destination}`);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname).split('.').pop();
      const new_file_name = Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + ext;
      cb(null, new_file_name);
    },
  });

  const limits = {
    fields: 100,
    fileSize: 1024 * 1024 * 5,
    files: 10,
    parts: 200,
  };

  const fileFilter = function (req, file, cb) {
    if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const upload = multer({ storage, limits, fileFilter }).single(field_name);

  return function (req, res) {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (err) {
        if (err) {
          resolve({
            status: "error",
            msg: err,
          });
        } else if (req.file || req.files) {
          resolve({
            status: "success",
            file: req.file,
            files: req.files,
          });
        } else {
          resolve(null);
        }
      });
    });
  };
};

// const uploadMultipleFiles = function (field, destination, length = 10) {
//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, `/tmp/my-uploads/${destination}`);
//     },
//     filename: function (req, file, cb) {
//       const ext = path.extname(file.originalname).split('.').pop();
//       const new_file_name = Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + ext;
//       cb(null, new_file_name);
//     },
//   });

//   const limits = {
//     fields: 100,
//     fileSize: 1024 * 5,
//     files: 10,
//     parts: 200,
//   };

//   const fileFilter = function (req, file, cb) {
//     if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//     }
//   };

//   const upload = multer({ storage, limits, fileFilter }).array(field, length);

//   return new Promise(function (resolve, reject) {
//     upload(req, res, function (err) {
//       if (err instanceof multer.MulterError) {
//         // A Multer error occurred when uploading.
//         reject(err);
//       } else if (err) {
//         console.trace(err);
//         reject("Image file upload failed");
//       } else {
//         resolve(req.files);
//       }
//     });
//   });
// };

module.exports = {
  uploadFile,
  // uploadMultipleFiles,
};
