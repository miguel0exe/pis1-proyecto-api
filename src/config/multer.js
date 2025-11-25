import multer from "multer";
// almacenar archivo temporalmente en memoria
const storage = multer.memoryStorage();

const upload = multer({ storage });

export { upload };
