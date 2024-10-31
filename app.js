const express = require('express');
const app = express();
const fs = require('fs')
require("dotenv").config()
const path = require('path');
const MONGODB_URI = process.env.DB_MONGOOSE;
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore= require('connect-mongodb-session')(session)
const flash = require('connect-flash');
const Product = require('./models/product')
const User = require('./models/user');
const compression = require('compression')
const helmet = require('helmet')
const morgan = require('morgan')
const travelRoute = require('./route/travel');
const userRoute = require('./route/reg');
const multer = require('multer')

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));




const store = new mongoStore({
  uri: MONGODB_URI,
  collection:'sessions'
})

app.use(session({
  secret: 'anna',
  resave: false,
  saveUninitialized: false,
  store:store
}));

app.use(flash());

app.use(async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});



app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());





app.use(travelRoute);
app.use(userRoute);

app.get('/', (req, res) => {
  res.redirect('/tours');
});


const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});



const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});



app.post('/add-tour', upload.array('images', 7), (req, res) => {
  console.log('Request Body:', req.body);
  const { name,  difficulty, discount, duration, location, category, maxGroupSize, price, startDates
,    description } = req.body;

const discountValue = discount || 0;
  const images = req.files ? req.files.map(file => file.path) : null;
  const userId = req.user
  Product.create({
    name: name,
    category:category,
    difficulty: difficulty,
    duration: duration,
    maxGroupSize: maxGroupSize,
    price: price,
    description: description,
    images: images,
    startDates:startDates,
    userId: userId,
    location:location,
    discount:discountValue
  })
    .then(result => {
      res.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});



app.post('/edit-product/:productId', async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, { $set: req.body }, { new: true });

    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags:"a"})
app.use(helmet());
app.use(compression())

app.use(morgan('combined',{stream: logStream}))
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log('working');
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });