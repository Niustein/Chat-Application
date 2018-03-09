$(function(){
    let socket = io();
    let me;
    
    // Grab cookie information
    socket.emit('cookies', [getCookie('name'),getCookie('color')]);
    
    // outputs when send button is hit
    $('form').submit(function(){
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });
    
    //Updates user status, updating list of online users
    socket.on('update users', (msg) =>{
        // Reset users by clearing and then repopulating user list
        $('#users').empty();
        for (let user of msg){
            $('#users').append($('<li>').text(user.name));
        }
    });
    
    // Updates new text on the screen when somebody types
    socket.on('chat', (msg) => {
        let displayMessage = msg.time + ' <span>' + msg.user + '</span>: ' + msg.msg
        if(msg.user === me){
            displayMessage = '<div class=\"ttext\">' + displayMessage + "</div>" 
        }
    
       $('#messages').append($('<li>').html(displayMessage));
       $('#messages').find('li:last').find('span').css('color',msg.color);
       
    });
    
    // Deals with /nick and /nickcolor changes in the html
    socket.on('namecolorChange', (msg) =>{
        let displayMessage = "You are now <span>" + msg.name + "</span>.";

        $('#user').text("You are " + msg.name);
        
        $('#messages').append($('<li>').html(displayMessage));
        $('#messages').find('li:last').find('span').css('color',msg.color);
               
        me = msg.name;
        setCookie('name', encodeURIComponent(me), 1);
        setCookie('color', encodeURIComponent(msg.color), 1);
        
    });
    
    // Cookie code adapted from https://www.w3schools.com/js/js_cookies.asp
    function setCookie(cname, cvalue, exdays) {
        let d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    // Cookie code adapted from https://www.w3schools.com/js/js_cookies.asp
    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
});