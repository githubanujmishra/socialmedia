const mongoose = require('mongoose') ; 

mongoose
    .connect('mongodb+srv://anuj123:anuj123@lakeboycluster.v4ui1it.mongodb.net/SM?retryWrites=true&w=majority&appName=lakeboycluster')
    .then(() => console.log('db connected'))
    .catch((err) => console.log(err.message));