//Required NPM Packages
let axios = require('axios');
let cheerio = require('cheerio');
let mongoose = require('mongoose'); 
let db = require("../models");

/* Mongoose */ 
mongoose.Promise = Promise; // 
mongoose.connect("Heroku login and password", { // Connect to the Mongo DB
  useMongoClient: true
});


let mongooseConnection = mongoose.connection;

mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
  console.log(`Sucessfully Connected!`);
});

/* Main Code */
module.exports = (app) => { 

   /* Get Request */ 

  app.get("/", (req, res) => res.render("index"));


  app.get("/api/search", (req, res) => {

    axios.get("https://www.npr.org/series/631875330/editors-picks").then(response => {
      // console.log("Response");
      // Load response into cherio
      let $ = cheerio.load(response.data);

      let handlebarsObject = {
        data: []
      }; // Initialize Empty Object to Store Cheerio Objects

      $("article").each((i, element) => { // Search for all Article with HTML Tags
        //Convert low res images to high res.
        let lowResImageLink = $(element).children('.item-image').children('.imagewrap').children('a').children('img').attr('src');

        if (lowResImageLink) {

          let imageLength = lowResImageLink.length;
          let highResImage = lowResImageLink.substr(0, imageLength - 11) + "800-c100.jpg";

          handlebarsObject.data.push({ // Send to handlebarsObject
            headline: $(element).children('.item-info').children('.title').children('a').text(),
            summary: $(element).children('.item-info').children('.teaser').children('a').text(),
            url: $(element).children('.item-info').children('.title').children('a').attr('href'),
            imageURL: highResImage,
            slug: $(element).children('.item-info').children('.slug-wrap').children('.slug').children('a').text(),
            comments: null
          }); 
        } 
      }); // End of Serch

      // Handlebars Rendering
      res.render("index", handlebarsObject);
    });
  });

  // Saved Article Route
  app.get("/api/savedArticles", (req, res) => {

    db.Articles.find({}). // Find Selected Articles
    then(function(dbArticle) {
      // Send article back
      res.json(dbArticle);
    }).catch(function(err) {
      // Error handling
      res.json(err);
    });
  }); 

   /* Post Requests */ 
  app.post("/api/add", (req, res) => { // Add Article Route

    let articleObject = req.body;

    db.Articles. // Save the Article to the Database
    findOne({url: articleObject.url}). // Handle duplicates
    then(function(response) {

      if (response === null) { // Handle duplicates
        db.Articles.create(articleObject).then((response) => console.log(" ")).catch(err => res.json(err));
      }

      // Send message back only if the article was saved
      res.send("Article Saved");
    }).catch(function(err) {
      // Post error
      res.json(err);
    });

  }); 

  // Route to delete the article
  app.post("/api/deleteArticle", (req, res) => {
    // console.log(req.body)
    sessionArticle = req.body;

    db.Articles.findByIdAndRemove(sessionArticle["_id"]). // remove article by id
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); 

  // Route for deleting the route
  app.post("/api/deleteComment", (req, res) => {

    let comment = req.body;
    db.Notes.findByIdAndRemove(comment["_id"]). // Delete comment by id
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); 

  // Route for creating the note
  app.post("/api/createNotes", (req, res) => {

    sessionArticle = req.body;

    db.Notes.create(sessionArticle.body).then(function(dbNote) {

      return db.Articles.findOneAndUpdate({
        _id: sessionArticle.articleID.articleID
      }, {
        $push: {
          note: dbNote._id
        }
      });
    }).then(function(dbArticle) {

      res.json(dbArticle);
    }).catch(function(err) {
      // error communication
      res.json(err);
    });
  }); 

  // article id to note
  app.post("/api/populateNote", function(req, res) {


    db.Articles.findOne({_id: req.body.articleID}).populate("Note"). 
    then((response) => {
      // concatenate verbiage with response

      if (response.note.length == 1) { // Note Has 1 Comment

        db.Notes.findOne({'_id': response.note}).then((comment) => {
          comment = [comment];
          console.log("Responding with One Comment");
          res.json(comment); // Send Comment back to the Client
        });

      } else { 

        console.log("2")
        db.Notes.find({
          '_id': {
            "$in": response.note
          }
        }).then((comments) => {
          // console.log("Responding with Multiple Comments");
          res.json(comments); 
        });
      }
      // Send the article back to the client only if we were able to find it with an id
    }).catch(function(err) {
      // Error Handling
      res.json(err);
    });
  }); 

} 