var chat_channel = 'drawroll-chat';
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
    var dist = UUID + "^" + message.author + "^" + message.answer;

    if (message.type === 'attempt') {
        var code = '<p id="' + CryptoJS.MD5(dist) + '"><b>' + message.author + ':</b> ' + message.answer + '</p>';

        // host only
        if ($("#fence").data("param") === 'host') {
            code += "<button onclick='confirmAttempt(\"" + dist + '\")' + "'>Correct</button>" +
                    "<button onclick='rejectAttempt(\"" + dist + '\")' + "'>Error</button>";
        }

        $("#chat").find("#fence").prepend(code);
    } else if (message.type === 'err') {
        document.getElementById(CryptoJS.MD5(dist)).style.color = "red";
    } else if (message.type === 'succ') {
        document.getElementById(CryptoJS.MD5(dist)).style.color = "green";
    }
};

// server-only
var confirmAttempt = function(dist) {
    var m = dist.split("^");
    pubnub.publish({
        channel: chat_channel,
        message: {
            UUID: m[0],
            author: m[1],
            answer: m[2],
            type: 'succ'
        }
    });
}
var rejectAttempt = function(dist) {
    var m = dist.split("^");
    pubnub.publish({
        channel: chat_channel,
        message: {
            UUID: m[0],
            author: m[1],
            answer: m[2],
            type: 'err'
        }
    });
}

// client-only
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
$("#answer").keyup(function(event) {
    if (event.keyCode === 13) {
        publishAttempt();
    }
})
