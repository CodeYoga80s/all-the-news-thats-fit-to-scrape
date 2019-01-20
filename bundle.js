'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _expressHandlebars = require('express-handlebars');

var _expressHandlebars2 = _interopRequireDefault(_expressHandlebars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



/* Variables*/ 

// Post Body Request
/* Imports */ 
var PORT = process.env.PORT || 8080; // Express and Heroku

var app = (0, _express2.default)(); // Start Express

/* middleware */ 

app.use(logger("dev")); 
app.use(_bodyParser2.default.urlencoded({ extended: false })); // body-parser
app.use(_express2.default.static("public"));

// Handlebars Set Up
app.engine("handlebars", (0, _expressHandlebars2.default)({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

/* Routes */
require("./controllers/nprScraperController.js")(app);

/* Execution */

app.listen(PORT, function () {
    console.log('App listening on PORT ' + PORT);
});
