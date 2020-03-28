const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date");
const mongoose = require("mongoose");
const _=require("lodash")

mongoose.connect("mongodb+srv://todoList-v1:todoL@todolist-v1-tfvjk.mongodb.net/todoList-v1", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify:false
});
const app = express();

// schema and models
const itemSchema = {
  name: String
};
const itemModel = mongoose.model("Item", itemSchema);

// values
const buy = new itemModel({
  name: "make route"
});
const cook = new itemModel({
  name: "Add items"
});
const eat = new itemModel({
  name: "visit it anytime"
});
const defaultValues = [buy, cook, eat];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  var day = date.getDay();
  itemModel.find({}, (err, foundItems) => {
    if (err) console.log(err);
    else {
      if (foundItems == 0) {
        itemModel.insertMany(defaultValues, err => {
          if (err) console.log(err);
          else console.log("inserted");
        });
        res.redirect("/");
      } else {
        res.render("list", { kindOf: "Today", newItems: foundItems });
      }
    }
  });
});

app.post("/", function(req, res) {
  var listName = req.body.listName;
  var item = new itemModel({
    name: req.body.newItem
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    customItemsModel.findOne({ listName: listName }, (err, foundItems) => {
      foundItems.items.push(item);
      foundItems.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", (req, res) => {
  var checked = req.body.checked;
  var listName = req.body.listName;
  if (listName == "Today") {
    itemModel.findByIdAndRemove(checked, err => {
      if (err) console.log(err);
      else res.redirect("/");
    });
  } else {
    customItemsModel.findOneAndUpdate(
      { listName: listName },
      { $pull: { items: { _id: checked } } },
      (err, foundItems) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// CUSTOM LIST
const customItemsSchema = {
  listName: String,
  items: [itemSchema]
};
const customItemsModel = mongoose.model("Customlist", customItemsSchema);

app.get("/:custom", (req, res) => {
  var listName = _.capitalize(req.params.custom);
  customItemsModel.findOne({ listName: listName }, (err, foundItems) => {
    if (!err) {
      if (!foundItems) {
        const newCustom = new customItemsModel({
          listName: listName,
          items: defaultValues
        });
        newCustom.save();
        res.redirect("/" + listName);
      } else {
        console.log(foundItems.items);
        res.render("list", {
          kindOf: foundItems.listName,
          newItems: foundItems.items
        });
      }
    }
  });
});

// server connection
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
} 

app.listen(port, function() {
  console.log("Server connected ");
});
