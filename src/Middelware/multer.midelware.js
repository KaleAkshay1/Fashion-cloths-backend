import multer from "multer";

const storage = multer.diskStorage({
  destination: function (_, file, cb) {
    cb(null, "./public");
  },
  filename: function (_, file, cb) {
    cb(null, file.originalname);
  },
});

const uplode = multer({ storage });

const imageFields = [];

for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 6; j++) {
    const name = `${i}image${j}`;
    imageFields.push({ name, maxCount: 1 });
  }
}

export { uplode, imageFields };
