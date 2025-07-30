/*const express = require ("express");
const socket = require("socket.io");
const http = require("http")
const {Chess} = require("chess.js");
const path = require("path");
const session = require("express-session");
//instance of express
const app = express();

//socket io documentation, these to lines to connect the socket io server to express js server 
const server = http.createServer(app);
const io = socket(server);
//for all the chess rules , from something called chess.js
const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.use(express.urlencoded({extended:true}))
//to use ejs, very similar to html 
app.set("view engine", "ejs");
//middleware -to use static files,html,vanilla files
app.use(express.static(path.join(__dirname,"public")));
app.set("views",(path.join(__dirname,"views")));
app.use(session({
    secret: "secretkey",
    resave:false,
    saveUninitialized:true

}))


app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"});
});

app.get("/", (req, res) => {
  res.render("register");
});

//chessboard is protected at chess
//only logged in users can acccess chess
app.get("/chess", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  res.render("index", { title: "Chess Game" });
});


//Simulated user database in memory
const users = new Map();

//get register page
app.get("/register",(req,res)=>{
    res.render("register")
});
//POST login page logic
app.post("/register",(req,res)=>{
    const {username,password} = req.body;
    if(users.has(username)){
        return res.send("Username already taken, Please go back and choose another")
    }
    users.set(username,password);
    console.log("User registered:", username);
    res.redirect("/login")

});
//get login page
app.get("/login",(req,res)=>{
    res.render("login");
});

//POST login page logic
app.post("/login", (req,res)=>{
    const {username, password} = req.body;
    if(!users.has(username) || users.get(username)!==password){
        return res.send("Inavlid credentials, Please try again");
    }

   //logic to guide to the chess board after the login is succesful
   req.session.username = username;
   res.redirect("/game");
});




app.get("/game",(req,res)=>{
    if( !req.session.username ){
        return res.redirect("login");
    }
    res.render("loading", { username: req.session.username });
})



//this is basically the response from the server back to the people joining the website to play the game 
io.on("connection",function(uniquesocket){//unique information
    console.log("connected");
    
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id === players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move",(move)=>{
        try{
            //if try catch is not used server might crash due to wrong moves called at the front end
            //black ke time pei black chalega aur white ke time pei white
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;
            
           const result = chess.move(move);
           if(result){
            currentPlayer = chess.turn();
            io.emit("move", move);
            io.emit("boardState",chess.fen())
           }else{
            console.log("Invalid move:",move);
            uniquesocket.emit("invalidMove",move);
           }
        }catch(err){
            console.log(err);
            uniquesocket.emit("Inavlid move :", move);
        }
    })
});

server.listen(3000,function(){
    console.log("listening on port 3000");
});
*/
// 1. IMPORTS
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const session = require("express-session");

// 2. INIT EXPRESS + SOCKET.IO
const app = express();
const server = http.createServer(app);
const io = socket(server);

// 3. CHESS STATE
const chess = new Chess();
let players = {};
let currentPlayer = "w";

// 4. MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

// 5. IN-MEMORY USER STORE
const users = new Map();

// 6. ROUTES

// --- Home (register) ---
//app.get("/", (req, res) => {
//  res.render("register");
//});

app.get("/", (req, res) => {
  if (req.session.username) {
    return res.redirect("/game"); // if already logged in, go to game
  }
  res.redirect("/register"); // else go to register
});


// --- Register ---
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.has(username)) {
    return res.send("Username already taken, please go back and choose another.");
  }
  users.set(username, password);
  console.log("User registered:", username);
  res.redirect("/login");
});

// --- Login ---
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!users.has(username) || users.get(username) !== password) {
    return res.send("Invalid credentials. Please try again.");
  }
  req.session.username = username;
  res.redirect("/game");
});

// --- Loading screen (3s animation) ---
app.get("/game", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  res.render("loading", { username: req.session.username });
});

// --- Chess board (protected) ---
app.get("/chess", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
 res.render("index", {
    title: "Chess Game",
    username: req.session.username, // ✅ Pass username to EJS
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});

// 7. SOCKET.IO LOGIC
/*
io.on("connection", function (uniquesocket) {
  console.log("connected");

  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("spectatorRole");
  }

  uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });

  uniquesocket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
      if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move:", move);
        uniquesocket.emit("invalidMove", move);
      }
    } catch (err) {
      console.log(err);
      uniquesocket.emit("Invalid move:", move);
    }
  });
});*/


io.on("connection", function (uniquesocket) {
  console.log("connected");

  let assigned = false;

  uniquesocket.on("setUsername", (username) => {
    uniquesocket.username = username;

    // Assign player roles
    if (!players.white) {
      players.white = { id: uniquesocket.id, username };
      uniquesocket.emit("playerRole", "w");
      assigned = true;
    } else if (!players.black) {
      players.black = { id: uniquesocket.id, username };
      uniquesocket.emit("playerRole", "b");
      assigned = true;
    }

    if (!assigned) {
      uniquesocket.emit("spectatorRole");
    }
  });

  uniquesocket.on("disconnect", () => {
    if (players.white?.id === uniquesocket.id) {
      delete players.white;
    } else if (players.black?.id === uniquesocket.id) {
      delete players.black;
    }
  });

  uniquesocket.on("move", (move) => {
    if (
      (chess.turn() === "w" && uniquesocket.id !== players.white?.id) ||
      (chess.turn() === "b" && uniquesocket.id !== players.black?.id)
    ) {
      return;
    }

    const result = chess.move(move);
    if (result) {
      io.emit("move", move);
      io.emit("boardState", chess.fen());
    } else {
      uniquesocket.emit("invalidMove", move);
    }
  });
});


// 8. START SERVER
server.listen(3000, function () {
  console.log("listening on port 3000");
});


