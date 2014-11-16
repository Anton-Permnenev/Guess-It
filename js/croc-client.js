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