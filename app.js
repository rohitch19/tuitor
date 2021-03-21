const express = require('express');
const app = express();
const morgan = require('morgan');

//morgan used to show the urls in console
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer=require('nodemailer');




//cookies t store jwt token
//const cookieParser = require('cookie-parser');
//database connection
mongoose.connect('mongodb+srv://rohit:rohit@cosups.cnw29.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

//const variables 
//const adminRoutes = require('./api/routes/admin');

//view engine
app.set('view engine' , 'ejs');

app.use(express.static(__dirname + '/public'));
//app.use('/promos',express.static(__dirname + '/promos'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(cookieParser('cosups'));

//routes handling 

//app.use('/admin', adminRoutes);

const User = require('./model/user');

app.get('/', (req, res , next)=>{
    res.redirect('/index');
});

app.post('/verify', (req, res , next)=>{

    var otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);
    const accountSid = "AC0057e3b562a6a6f4bf98f7acbbc8a54b";
    const authToken = "574015560a322f2746a83d3efa133a65";
    const client = require('twilio')(accountSid, authToken);

    client.messages
    .create({
        body: 'OTP is ' + otp,
        from: '+17033489709',
        to: "+91"+req.body.phone
    })
    .then(message => console.log(message.sid));
    //var expiry = new Date().getTime.toString ;
    //expiry.setMinutes(expiry.getMinutes() + 1);
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        firstname : req.body.fname,
        lastname : req.body.lname ,
        phone : req.body.phone,
        status : "not",
        otp : Number(otp) ,
        expiry : new Date().getTime() + 120000
      });
        user.save()
        .then(result => {
             console.log(result);
            return res.render('./otpverify', {phone : req.body.phone});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    
});

app.post('/verification', (req, res , next)=>{
    console.log(req.body);
    User.findOne({phone : req.body.phone})
      .exec()
      .then(udata => {
          console.log("udataaaqaaaaaaaaaaaaaaaaaa" + udata);
          console.log("test 1 .............................");
          if(udata)
          {
            console.log("test 2 .............................");
            console.log("otp sent" + req.body.otp);
            console.log(" otp in db " + udata.otp );
            if(req.body.otp == udata.otp )
            {
                console.log("test 3 ............................." + new Date().getTime());
                if(new Date().getTime() <= udata.expiry)
                {
                    console.log("test 4 .............................");
                    User.findOneAndUpdate({phone : req.body.phone} , {status : "verified"})
                   .exec()
                    .then(data =>{
                      return res.render('./dash', {note : "verified"});
                    })
                  .catch(err => {
                  console.log(err);
                  res.status(500).json({
                      error: err
                   });
                 });
                    
                 }
                 else
                 {
                    console.log("test 5 .............................");
                    return res.render('./dash', {note : "otp expired"});
                 }
             }
            else
            {
                console.log("test 6 .............................");
                return res.render('./dash', {note : "otp invalid"});
            }
          }
        
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });

    
});


app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status(404);
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error : {
            message: error.message
        }
    })
});


module.exports = app;