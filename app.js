
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

// Database connection
const mongoDBUrl = process.env.MONGODBURL;
mongoose.connect(mongoDBUrl);

// Items Schema
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your To Do List!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const fullDate = date.getDate();

app.get("/", function(req, res) {
    Item.find(function(err, items) {
        if (err) {
            console.log(err);
        } else {
            if (items.length === 0) {
                Item.insertMany(defaultItems, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully added the default items to the DB.");
                        res.redirect("/");
                    }
                });
            } else {
                res.render("list", {listTitle: fullDate, newListItems: items});
            }
        }
    });
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if (listName === fullDate) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === fullDate) {
        Item.deleteOne({_id: checkedItemId}, function(err) {
            if (!err) {
                console.log("Successfully deleted the selected item!");
            }
            res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if (foundList !== null) {
            // Show list to the user
            res.render("list", {listTitle: customListName, newListItems: foundList.items});
        } else {
            // Create a new list so it exists
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        }
    });
    
});

app.listen(3000, function() {
    console.log("Server started succesfully on port 3000.");
});