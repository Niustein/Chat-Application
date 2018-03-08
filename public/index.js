// Adapted from https://tutel.me/c/programming/questions/10730362/get+cookie+by+name and the mozilla web page API found here https://developer.mozilla.org/en-US/docs/Web/API/document/cookie
function getCookieVal(cKey){
    let regex = new RegExp("(?:(?:^|.*;\\s*)" + cKey +  "\\s*\\=\\s*([^;]*).*$)|^.*$")
    let cookieVal =  document.cookie.replace(regex, "$1");
    return cookieVal;
}

// Pushes message to chat adding tags as appropriate, bolding if it was users own text
function pushMessageToChat(message, boldFlag){
    if (boldFlag){
        $('#messages').append($('<li>').append($('<b>')
                        .append($('<p>')
                                .attr("class", "chatMessage")
                                .text(message.cTime + " ")
                                )
                        .append($('<p>')
                                .attr("class", "chatMessage")
                                .css("color",message.user.color)
                                )
                        .append($('<p>')
                                .attr("class", "chatMessage")
                                .text(message.msg)
                                )
                        ));
    } else {
        $('#messages').append($('<li>')
                        .append($('<p>')
                                .attr("class", "chatMessage")
                                .text(message.cTime + " ")
                                )
                        .append($('<p>')
                                .attr("class", "chatMessage")
                                .css("color",message.user.color)
                                )
                        .append($('<p>')
                                .attr("class", "chatMessage")
                                .text(message.msg)
                                )
                        );        
    }
}

$(function(){
    let socket = io();
    let username = "";
    let cookieUsername = getCookieVal("username");
    
    // Checks if cookie exists and passes appropriate parameters
    if (cookieUsername === ""){
        //Cookie does not exist
        socket.emit("init", null, null);
    } else {
        // cookie exists
        socket.emit("init", cookieUsername, getCookieVal("nickColor"));
    }
    
    $('form').submit(function(){
        //Parses input and executes code based on what was typed
        let inputText = $('#m').val();
        if(inputText.startsWith("/nick")){
            // Split the input text and serialize text
            let splitText = inputText.split(/\s+/);
            let ANCheck = /^[a-z0-9]+$/i;       //Check alphanumeric
            if(ANCheck.test(splitText[1])){
                //Name is alphanumeric
                socket.emit("setUsername", splitText[1]);
            } else {
                socket.emit("systemMessage", "Invalid name");
            }
        } else if(inputText.startsWith("/nickcolor")){
            // Split the input text and seralize text
            let splitText = inputText.split(/\s+/);
            let hexaCheck = /^[A-F0-9]+$/i;
            if(hexaCheck.test(splitText[1])){
                socket.emit("setNickColor", '#' + splitText[1]);
            } else {
                socket.emit("systemMessage", "Invalid color");
            }
        } else {
            // Prints message normally
            socket.emit('chat', inputText);
        }
        $('#m').val('');
        return false;        
    });
    
    socket.on("init", function(messageLog, currentUsers){
        for(i in messageLog){
            if(messageLog[i].type === "chat"){
                let messageUserCheck = messageLog[i];
                // Check if message was by main user, sent true for bold flag
                if(messageUserCheck.user.nickname === username){
                    pushMessageToChat(messageUserCheck, true);
                }  else {
                // Is not by main user, send false for bold flag
                pushMessageToChat(messageUserCheck, false);
                }
            } else {
                // type is not chat, append chat and current time tags accordingly
                $('#messages').append($('<li>').append($('<i>').text(messageLog[i].cTime + " " + messageLog[i].message)));
            }
        }
        
        for(i in currentUsers){
            // For online users, append nickname and color tags appropriately
            $('#usersOnline').append($('<li>').text(currentUsers[i].nickname).css("color", currentUsers[i].color));
        } 
    });

    socket.on('chat', function(user, message, cTime){
       let oMessage = {
           user: user,
           message: message,
           cTime: cTime
       };
       
       if(user.nickname === username){
           pushMessageToChat(oMessage, true);
       } else {
           pushMessageToChat(oMessage, false);
       }
    });
    
    socket.on("uOnlineUsers", function(onlineUsers){
        //reset user list and rebuild
        $('#usersOnline').empty();
        for(i in onlineUsers){
            $('#usersOnline').append($('<li>').text(onlineUsers[i].nickname).css("color", onlineUsers[i].color));
        }
    });
    
    socket.on('systemMessage', function(message, cTime){
       $('messages').append($('<li>').append($('<i>').text(cTime + " " + message))); 
    });
    
    socket.on('setNickColor', function(color){
       document.cookie = "nickColor=" + color; 
    });

    socket.on('setUsername', function(uName){
        username = uName;
        $('user').text("Welcome: " + username);
        document.cookie = "username=" + username;
    });
    
    
});









