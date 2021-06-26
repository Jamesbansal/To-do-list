//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _=require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-james:Test-123@cluster0.pzb3k.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser:true});
const itemschema=new mongoose.Schema({
  name: String
})
const Item=mongoose.model("Item",itemschema)
const item1=new Item({
  name: "Get Food"
})
const item2=new Item({
  name: "Eat Food"
})
const item3=new Item({
  name: "Do Work"
})
const defaultItems=[item1,item2,item3]

const listSchema=new mongoose.Schema({
  name: String,
  items: [itemschema]
});
const List=mongoose.model("List",listSchema)


app.get("/", function(req, res) {

  Item.find({},function(err,items){
    if(err){
      console.log(err);
    }else{
      if(items.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Success");
          }
        });
        res.redirect("/")
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }

    }
  })

});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundList.name,
        newListItems:foundList.items})
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list
  const itemnew=new Item({
    name:itemName
  });
  if (listname==="Today"){
    itemnew.save()
    res.redirect("/")
  }else{
    List.findOne({name:listname},function(err,foundList){
      foundList.items.push(itemnew);
      foundList.save();
      res.redirect("/"+listname)
    })
  }



});
app.post("/delete", function(req, res){
const checkedItemID=req.body.checkbox;
const listname=req.body.listName
if(listname==='Today'){
  Item.deleteOne({_id:checkedItemID},function(err){
    if(err){
      console.log(err);
    }else{
      // console.log("success delete");
    }
  })
  res.redirect("/")
}else{
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedItemID}}} ,function(err){
    if(!err){
      // console.log("success custom delete");
      res.redirect("/"+listname)
    }
  })
}

});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
