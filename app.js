//requiring packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

//using express
const app = express();
//using body parser
app.use(bodyParser.urlencoded({ extended: true }));

//using static folder with express
app.use(express.static("public"));

//make Ejs format as view engine to render pages
app.set("view engine", "ejs");

//connecting to mongoDB server
mongoose.connect("mongodb+srv://admin-abo-ah-md:Aboahmed1@cluster0.seklmge.mongodb.net/todolistDB");

//item schema blueprint
const itemSchema = {
  name: String,
};

//initiallizing the schema with a model
//note prefered capitalized First litter + name as singular
const Item = mongoose.model("Item", itemSchema);
 
//adding new items
const checkThecar = new Item({
  name: "oilChange",
});

const meetingwithTheteam = new Item({
  name: "teamMeeting",
});

const moneyTransfer = new Item({
  name: "negoticate money",
});

//making a difault array

const defaultItems = [checkThecar, meetingwithTheteam, moneyTransfer];

//list schema blueprint + items schema
const newlistschema = {
  name: String,
  items: [itemSchema],
};

//initiallizing the schema with a model

const List = mongoose.model("List", newlistschema);

/**/
//main page rendering
app.get("/", (req, res) => {
  //to know if list has no items add default
  Item.find({}, (err, itemsArr) => {
    if (itemsArr.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("succefully added");
        }
      });
      res.redirect("/");


      //this will show items if the list has any 
    } else {
      res.render("list", { listTitle: "Today", newItem: itemsArr });
    }
  });
});

//to open new page with new list name 
app.get("/:customlistname", (req, res) => {
  const customlistname = _.capitalize(req.params.customlistname) ;
//this will check if the list had already been created if not it will create a new one 
  List.findOne({ name: customlistname }, (err, foundlist) => {
    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: customlistname,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customlistname);
      }
       else {
        
        res.render("list", {
          listTitle: foundlist.name,
          newItem: foundlist.items });
      }
    }
  });
});

//rendering about Ejs page
app.get("/about", (req, res) => {
  res.render("about");
});

//adding new items
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName= req.body.list;


  const newItem = new Item({
    name: itemName
  });
 

  if (listName==="Today") {
     newItem.save();
      res.redirect("/");
  }
  else{
    List.findOne({name:listName},(err,foundlist)=>{
if (err) {
  console.log(err);
}
else{
  
      foundlist.items.push(newItem);
      foundlist.save();
      res.redirect("/"+listName)
    }
    })
  }

  
});

//checkbox removes items and redirect to
app.post("/delete", (req, res) => {
 

  const CheckedItemdId = req.body.checkbox;
  const listName= req.body.listName;

  if (listName==="Today") {
    

    Item.findByIdAndRemove({ _id: CheckedItemdId }, (err) => {
      if (!err) {
        console.log("yay");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  }

  else{

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:CheckedItemdId}
    }},
    (err,result)=>{
if (!err) {
  res.redirect("/"+listName)
  
}
else if(err){console.log(err);}
    })
  }


});

let port = process.env.PORT;
if (port==null||port=="") {
  port=3000;
}
//express server start to open at port
app.listen(port, () => {
  console.log("started");
});
