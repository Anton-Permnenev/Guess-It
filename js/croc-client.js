function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var num = getParameterByName('host');
var chat_channel = 'croc-chat' + num;
var pubnub = PUBNUB.init({
    publish_key: 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
    subscribe_key: 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe'
});
var UUID = PUBNUB.db.get('session') || (function(){
        var uuid = PUBNUB.uuid();
        PUBNUB.db.set( 'session',uuid );
        return uuid;
    })();

pubnub.subscribe({
    channel: chat_channel,
    callback: insertIntoChat
});

function insertIntoChat(message) {
    var dist = message.UUID + "^" + message.author + "^" + message.answer;
    var crypto = CryptoJS.MD5(dist);

    if (message.type === 'attempt') {
        var code = '<p><div id="' + crypto + '" class="col-sm-8"><b>' + message.author + ':</b> ' + message.answer + '</div></p>';

        $("#chat").find("#fence").prepend(code);
    } else if (message.type === 'err') {
        document.getElementById(crypto).style.color = "red";
    } else if (message.type === 'succ') {
        document.getElementById(crypto).style.color = "green";
    }
};

var publishAttempt = function() {
    pubnub.publish({
        channel: chat_channel,
        message: {
            UUID: UUID,
            author: document.getElementById('author').value,
            answer: document.getElementById('answer').value,
            type: 'attempt'
        }
    });
    document.getElementById('answer').value = "";
}

document.getElementById('submit').addEventListener('click', publishAttempt);
$("#answer").keyup(function (event) {
    if (event.keyCode === 13) {
        publishAttempt();
    }
});

// Let's make a call
(function(){
    // ~Warning~ You must get your own API Keys for non-demo purposes.
    // ~Warning~ Get your PubNub API Keys: http://www.pubnub.com/get-started/
    // The phone *number* can by any string value
    var phone = PHONE({
        number        : (1000 + (1 + Math.random()*1000)^0).toString(), // Random number to the client
        publish_key   : 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
        subscribe_key : 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe',
        ssl           : true
    });

    // As soon as the phone is ready we can make calls
    phone.ready(function(){

        // Dial a Number and get the Call Session
        // For simplicity the phone number is the same for both caller/receiver.
        // you should use different phone numbers for each user.
        var session = phone.dial(num);

    });

    // When Call Comes In or is to be Connected
    phone.receive(function(session){

        // Display Your Friend's Live Video
        session.connected(function(session){
            PUBNUB.$('video-out').appendChild(session.video);
        });

    });

})();