let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;

let listUser = [];
let listMessage = [];

http.listen(port,() =>{
    console.log('listening on port: ', port);
});

app.use(express.static(__dirname + '/public'));

function genRandomName(){
    let uniqueFlag = false;
    let count = 0;
    while(!uniqueFlag){
        let rNum = count;
        let username = "User" + rNum;
        if(!(username in listUser)){
            listUser.append(username)
            uniqueFlag = true;
        } else {
            count += 1;
        } 
        
    }
    return username;
}

/*
function genRandomColor(){
    let alphanumeric = "ABCDEF0123456789";
    let newColor = "#";
    let randomPick;
    for (let i = 0; i < 6; i++){
        randomPick = Math.floor(Math.random() * 16);
        newColor += alphanumeric[randomPick];
    }
    return newColor;
} */

function getCurrentTime(){
    let currentTime;
    let date = new Date();
    currentTime = date.getHours() + ":" + date.getMinutes() + " ";
    return currentTime;    
}

function checkUniqueName(username){
    for(i in listUser){
        if (listUser[i] === username){
            return false;
        }
    }
    return true;
}

/*
function checkValidColor(c){
    return c.length === 6 && !isNaN(parseInt(c, 16));
} */

/*
function maintainMessageLog(m){
    if(m.length < 200){
        listMessage.push(m);
    } else if (m.length === 200){
        listMessage.shift()
        listMessage.push(m);
    }
} */

function addListMessage(type, message, cTime, user){
    if(type === "chat"){
        let dupUser = {
            nickName: user.nickName,
            color: user.color,
        };
        
        let oMessage = {
            type: type,
            message: message,
            cTime: cTime,
            user: dupUser,
        };
        
        if (addListMessage.length === 200){
            listMessage.shift();
            listMessage.push(oMessage);            
        }
    } else {
        let oMessage = {
            type: type,
            message: message,
            cTime: cTime
        };
        if (addListMessage.length === 200){
            listMessage.shift();
            listMessage.push(oMessage);            
        }
    }
}

io.on('connection', function(socket){
    console.log('a user connected');
    let user = {};
     
    socket.on("init", function(username, nickColor){
        let newUserFlag = false; //Sets new-user flag to false before running test
        
        // If the user does not have a username, assign a random name and set newUser flag to true, Otherwise, assign name/color to what they were
        if(username === null){
            let uNickName = genRandomName();
            user = {
                nickname: uNickName,
                color: "#000000"
            };
            socket.emit("setNickColor", "#000000");
            newUserFlag = true;
        } else {
            user = {
                nickname: username,
                color: nickColor,
            };
        }
        
        listUsers.push(user);
        socket.emit("setUsername", user.nickname);
        socket.emit("init", listMessage, listUsers);
        
        // Determine current time and update chat that a user has joined the chat
        let cTime = getCurrentTime();
        io.emit("systemMessage", user.nickname + " has joined the chat", cTime);
        socket.emit("uOnlineUsers", listUsers);
        
        // Add the system message to the message list
        addListMessage("systemMessage", user.nickname + " has joined the chat", cTime);
        
    });
    
    socket.on("setUsername", function(newRequested){
        if (checkUniqueName(newRequested)){
            let cTime = getCurrentTime();
            io.emit("systemMessage", user.nickname + " has changed names to: " + newRequested, cTime);
            addListMessage("systemMessage", user.nickname + " has changed names to: " + newRequested, cTime);
            
            socket.emit("setUsername", newRequested);
            user.nickname = newRequested;
            io.emit("uOnlineUsers", listUsers);
        } else {
            let cTime = getCurrentTime();
            socket.emit("systemMessage", "The username " + newRequested + " has already been taken", cTime);
        }
    });
    
    socket.on("setNickColor", function(color){
        user.color = color;
        socket.emit("sysMessage", "your new color is: " + color, getCurrentTime());
        socket.emit("setNickColor", color);
        io.emit("uOnlineUsers", user);
    });
    
    socket.on("chat", function(message){
        let cTime = getCurrentTime();
        io.emit("chat", user, message, ctime);
        addListMessage("chat", message, cTime, user);
    });
    
    socket.on('disconnect', function(){
       console.log('a user disconnected'); 
       
       let cTime = getCurrentTime();
       io.emit("systemMessage", user.nickname+ " has left", cTime);
       
       // Update listUsers by removing user who left
       for(i in listUsers){
           if(listUsers[i] === user.nickname){
               listUsers.splice(i, 1);
               break;
           }
       }
       socket.broadcast.emit("uOnlineUsers", users);
       
    });
});







