 /*  Importing everything */
let express = require('express'); // Express
let bodyParser = require('body-parser'); // Post requests
let exphbs = require('express-handlebars'); // Views
var db = require("./models"); // Models


/* Variables*/

let PORT = process.env.PORT || 8080; // Set up Express and Heroku
let app = express(); // Initialize Express

/* Middleware */


app.use(bodyParser.urlencoded({ extended: false })); // Submission handling
app.use(bodyParser.json());
app.use(express.static("public"));

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

/* Routes */
require("./controllers/nprScraperController.js")(app);

/* Execution */

app.listen(PORT, ()=>{
    console.log(`App listening on PORT ${PORT}`);
})
