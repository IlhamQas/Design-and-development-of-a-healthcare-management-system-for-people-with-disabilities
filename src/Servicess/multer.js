
import multer from 'multer';
import { nanoid } from 'nanoid';

export function myMulter(customValidation) {
  const storage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + nanoid() + '_' + file.originalname);
    }
  });

  function fileFilter(req, file, cb) {
   
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'), false); 
    }
  }     

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 
    }
  });

  return upload;
}


export const fileValidation = {
  imag: ['image/png', 'image/jpeg'], 
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/avi', 'video/mkv'],  
  all: ['image/png', 'image/jpeg', 'application/pdf', 'video/mp4', 'video/avi', 'video/mkv'],  
};

export const HME = (error, req, res, next) => {
  if (error) {
    res.status(400).json({ message: 'خطأ في رفع الملف', error: error.message });
  } else {
    next();
  }
};


/*
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });
*/



