/* Samuel Niu
* 10047006
* SENG 513 - Assignment #3
* Web chat
*/

//Socket shenanigans
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;

// Arrays that will be used to store the connected users and the message history
let usersList = [];
let messagesList = [];

// Listens to port
http.listen(port, () =>{
    console.log('listening on port: ', port);
});

app.use(express.static(__dirname + '/public'));

// Listens for chat
io.on('connection', (socket) =>{
    // Prints to console that a user has connected
    console.log("connected");
    
    // Create a user object containing name and color
    let user = {
        name: '',
        color: ''        
    };
    
    // Chat section, deals /nick /nickcolor and general text
    socket.on('chat', (msg) =>{
        let time = getDate();
        
        // Create message object containing timesteam, username, user color, and message
        let message = {
            time: time,
            user: user.name,
            color: user.color,
            msg: msg
        };
        

        // Split text conditions and serialize chat for /nick and /nickcolor
        let splitText = msg.split(/\s+/);
        let ANCheck = /^[a-z0-9]+$/i;               // Alphanumeric check
        let hexaCheck = /^[A-F0-9]{6}/i;            // Hexadecimal check
        
        
        if(splitText[0] === '/nickcolor'){
            let wantedColor = msg.substring(11);
            
            if(hexaCheck.test(wantedColor)){
                user.color = '#' + wantedColor;
                socket.emit('namecolorChange', user);
                io.emit('update users', usersList)
            }
        } else if (splitText[0] === '/nick'){
            let wantedName = msg.substring(6);
            
            if(ANCheck.test(wantedName)){
                // create a function to check if name is already taken
                function isUsed(object){
                    return object.name === wantedName;
                }
                
                if(usersList.find(isUsed) === undefined && wantedName.length > 0){
                    user.name = wantedName;
                    socket.emit('namecolorChange', user);
                    io.emit('update users', usersList);
                }                
            }
        } else if (msg.trim() === "") {
            
        } else {
            io.emit('chat', message);
            if (messagesList.length < 200){
                messagesList.push(message);
            } else if (messageList.length === 200){
                messagesList.shift();
                messagesList.push(message);
            }
        }
    });
    
    //Deals with cookies upon rejoining website
    socket.on('cookies', (msg) => {
        // Decode cookie then see if the first element (name) is empty
        let cookieName = decodeURIComponent(msg[0]);
        
        // If the cookie is not empty, assign name and color to user, and re-push user into users list
        if (cookieName !== ''){
            // Create a function that will be called to check if cookiename is already in use
            function isUsed(object){
                return object.name === cookieName;
            }
        
            if(usersList.find(isUsed) === undefined){
                user.name = cookieName;
                user.color = decodeURIComponent(msg[1]);
                usersList.push(user);
            } else {
                // user cookie is not empty but name their name has been taken
                user = generateUser();
            }
        } else {
            user = generateUser();
        }
        
        // print message history for just joining user
        for(i of messagesList){
            socket.emit('chat', i);
        }
        socket.emit('namecolorChange', user);
        io.emit('update users', usersList);
        
    });
    
    
    
    socket.on('disconnect', () => {
        // Create a function used to find the index of the disconnected user in the users list
        function disconnectedUserIndex(object){
            return object.name === user.name;
        }
        
        usersList.splice(usersList.findIndex(disconnectedUserIndex), 1);
        io.emit('update users', usersList);
    });
    
    

});

/* Function to create a new user. Starts at "user0" and checks if this user is in the userslist.
* If the user is already in the userslist, increments genCount and repeats
* return value: user 
*/
function generateUser(){
    let genCount = 0;
    let newName = "user" + genCount;
    
    function isUsed(object){
        return object.name === (newName);
    }
    
    while(usersList.find(isUsed) !== undefined){
        genCount++;
        newName =  "user" + genCount;       
    }
    
    let user = {
        name: newName,
        color: '#000000'
    }
    
    usersList.push(user);
    return user;
}

/* Function to get the date to use for the timestamp
* return value: A string containing the hour,minute, and seconds value
*/
function getDate(){
    let d = new Date();
    let hour = d.getHours();
    let minute = d.getMinutes();
    let seconds = d.getSeconds();
    let currentTime = hour + ":" + minute + ":" + seconds;
    return currentTime;
}