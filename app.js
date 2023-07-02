const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require('mongoose');
const { log } = require("console");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(__dirname +"/views"));
mongoose.set("strictQuery",false);
mongoose.connect("mongodb://127.0.0.1:27017/shopDB",{useNewUrlParser: true});
const shopSchema=new mongoose.Schema({username: String,password: String,imagename: String,productid: Array});
const Shop = mongoose.model("Shop", shopSchema);
const accountSchema=new mongoose.Schema({product: String,cost: Number,company: String,manufacturedate: String});
const Account = mongoose.model("Account", accountSchema);
const typeSchema=new mongoose.Schema({type: String, productid: Array});
const Type = mongoose.model("Type", typeSchema);
var username="";
var password="";
var bool1="";
var dir="";
var i=0,l=0;
var a="",b="",c={},c1=[],c2="";
app.get("/", function(req, res)
{
    res.render("login", {e: ""});
});

app.post("/",async function(req, res)
{
    username=req.body.username;
    password=req.body.password;
    var l = await Shop.find({username: username, password: password}).exec();
    console.log(l.length);
    if(l.length==0)
    { 
        //res.send("Invalid username or password");   
        res.render("login",{e: "Invalid username or password"});
    }
    else
    {
        res.redirect("/account");
    }    
});

app.get("/signup", function(req, res)
{
    res.render("signup",{e: ""});
});

app.post("/signup", async function(req, res)
{
    username=req.body.username;
    password=req.body.password;
    var l = await Shop.find({username: username}).exec();
    console.log(l.length);
    if(l.length==0)
    { 
        const shop=new Shop({username: username, password: password, imagename: ""});
        //dir=__dirname+"/public/"+username;
        //fs.mkdirSync(dir);
        //console.log(dir);
        shop.save();
        //res.send("Successfully created account");
        res.redirect("/account");
    }
    else
    {
        res.render("signup",{e: "username already exist, please go to login page to login. If you want to create an account signup with another username"});
        //res.send("username already exist, please go to login page to login. If you want to create an account signup with another username"); 
    }
     
    /*Shop.find(function(err, shops){
      if(err)
        console.log(err);
      else
      {
        l=shops.length;
        bool1=0;
        for(i=0;i<l;i++)
        {
          if(shops[i].username==req.body.username)
          {
            bool1=1;
            break;
          }
        }
        if(bool1==1)
          res.send("username already exist, please go to login page to login. If you want to create an account signup with another username");
        else
        {
          console.log("username: "+username+" "+"password: "+password);
          const shop=new Shop({username: username, password: password, imagename: ""});
          dir=__dirname+"/public/"+username;
          fs.mkdirSync(dir);
          console.log(dir);
          shop.save();
          res.send("Successfully created account");
        }
      }
    });*/
});

app.get("/account", async function(req, res)
{
    var l = await Account.find({});
    console.log(l);
    res.render("account",{name: username, l: l,bool1: "", a: "", b: "",c2: ""});
});
app.post("/account", async function(req, res)
{
    s=req.body.search;
    a=req.body.company_a;
    b=req.body.company_b;
    c2=req.body.sort1;
    c={};
    c1=[];
    console.log(s);
    console.log(c);
    for(i in req.body)
    {
      if(i.substring(0,7)=="company")
      {
        c1.push(req.body[i]);
      }
      else if(s!="")
      {
        c.product=s;
      }

      console.log([i]);
    }
    if(c1.length>0)
    {
      c.company={$in: c1};
    }
    console.log(req.body);
    var l = await Account.find(c).exec();
    if(c2!="")
    {
        l.sort(function(a, b)
        {
          if(c2=="low")
              return(a.cost-b.cost);
          else if(c2=="high")
              return(b.cost-a.cost);
        });
    }
    console.log(l[0]._id);
    console.log((l[0]._id).toString());
    console.log(c);
    res.render("account",{name: username, l: l, bool1: s, a: a, b: b, c2: c2 });
});
/*
app.get("/table", function(req, res)
{
    res.send("<h1>Table</h1>");
});

app.get("/computer", function(req, res)
{
    res.send("<h1>Computer</h1>");
});
*/
app.get("/:l/:c", async function(req, res)
{
    var l1=req.params.l;
    console.log(l1);

    l = await Account.findById(req.params.c).exec();
    var l1 = await Shop.findOne({username: username});
    var r="save";
    if(l1.productid.includes(req.params.c))
        r="unsave";
    res.render("product",{name: username, l: l, r: r});
    /*if(l1=="table")
        res.send("<h1>Table2</h1>");
    else if(l1=="computer")
        res.send("<h1>Computer2</h1>");
    //res.render("product",{name: username, l: l });  */
});
app.post("/:l/:c", async function(req, res){
    var l1 = await Shop.findOne({username: username});
    console.log(l1);
    var r=req.body.submit;
    if(r=="save")
    {
        l1.productid.push(req.params.c);
        r="unsave";
    }
    else if(r=="unsave")
    {
        l1.productid.splice(l1.productid.indexOf(req.params.c),1);
        r="save";
    }
    await l1.save();
    res.render("product",{name: username, l: l, r: r});

});



app.get("/start", async function(req, res)
{
    var l1 = await Type.find({});
    var len=l1.length;
    var l=[];
    for(i=0;i<len;i++)
        l.push(await Account.find({_id: {$in: l1[i].productid}}));
    console.log(l);
    res.render("start",{name: username, l: l});
});



app.get("/savedproducts", async function(req, res)
{
    var l1 = await Shop.findOne({username: username});
    var l = await Account.find({_id: {$in: l1.productid}});
    console.log(l);
    res.render("savedproducts",{name: username, l: l});
});


app.get("/logindemo", async function(req, res)
{


  res.sendFile(__dirname + "/views/logindemo.html");
});

app.post("/logindemo", async function(req, res)
{

  console.log(req.body);
  res.json("Login Page Demo");
});


app.listen(3000, function()
{
  console.log("Server started on port 3000");
});
