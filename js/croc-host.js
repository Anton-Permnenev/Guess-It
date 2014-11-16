var rand = (1 + Math.random() * (1000)) ^ 0;
var num = rand.toString();
var passphrase;

(function () {
    var phone = PHONE({
        number: num,
        publish_key: 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
        subscribe_key: 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe',
        ssl: false
    });
    document.getElementById('num').innerHTML = num;


    // As soon as the phone is ready we can make calls
    phone.ready(function () {

        PUBNUB.bind('mousedown,touchstart', PUBNUB.$('tryguess'), function () {
            passphrase = document.getElementById('word').value;
            if (passphrase === '') {
                alert('You must set your word!');

            }else{
                document.getElementById('ww').innerHTML = passphrase;
                document.getElementById('word').value = "";
                $("#initModal").modal('hide');}
        });
        $("#word").keyup(function (event) {
            if (event.keyCode === 13) {
                passphrase = document.getElementById('word').value;
                if (passphrase === '') {
                    alert('You must set your word!');

                }else{
                document.getElementById('ww').innerHTML = passphrase;
                document.getElementById('word').value = "";
                $("#initModal").modal('hide');}
            }
        });
        $("#initModal").modal({
            show: true
        });
    });


})();

var chat_channel = 'croc-chat' + num;
var pubnub = PUBNUB.init({
    publish_key: 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
    subscribe_key: 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe'
});

pubnub.subscribe({
    channel: chat_channel,
    callback: responseToChat
});
pubnub.publish({
    channel: chat_channel,
    message: {
        UUID: "1",
        author: "Vasya",
        answer: "Sun",
        type: "attempt"
    }
})

function responseToChat(message) {
    var dist = message.UUID + "^" + message.author + "^" + message.answer;
    var crypto = CryptoJS.MD5(dist);

    if (message.type === 'attempt') {
        var code = '<p>' +
            "<div class=\"col-sm-4\" id=\"" + crypto + "_controls\">" +
            "<button onclick='confirmAttempt(\"" + dist + '\")' + "'><i class='glyphicon glyphicon-thumbs-up'></i></button>" +
            "<button onclick='rejectAttempt(\"" + dist + '\")' + "'><i class='glyphicon glyphicon-thumbs-down'></i></button>" +
            "</div>";
        code += '<div id="' + crypto + '" class="col-sm-8"><b>' + message.author + ':</b> ' + message.answer + '</div></p>';

        jQuery("#fence").prepend(code);
    } else if (message.type === 'err') {
        document.getElementById(crypto).style.color = "red";
    } else if (message.type === 'succ') {
        document.getElementById(crypto).style.color = "green";
    }
}

// server-only
var confirmAttempt = function (dist) {
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
    $("#" + CryptoJS.MD5(dist) + "_controls").remove();
    $("hostModal").modal('show');
}
var rejectAttempt = function (dist) {
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
    $("#" + CryptoJS.MD5(dist) + "_controls").remove();
}