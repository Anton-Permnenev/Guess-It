var chat_channel = 'drawroll-chat';
var pubnub = PUBNUB.init({
    publish_key: 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
    subscribe_key: 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe'
});
var UUID = PUBNUB.db.get('session') || (function () {
        var uuid = PUBNUB.uuid();
        PUBNUB.db.set('session', uuid);
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
        var code = '<div class="row" style="margin-bottom: 3px;margin-top: 3px">';

        // host only
        if ($("#fence").data("param") === 'host') {
            code += "<div class=\"col-lg-4\" id=\"" + crypto + "_controls\">" +
            "<button onclick='confirmAttempt(\"" + dist + '\")' + "'><i class='glyphicon glyphicon-thumbs-up'></i></button>" +
            "<button onclick='rejectAttempt(\"" + dist + '\")' + "'><i class='glyphicon glyphicon-thumbs-down'></i></button>" +
            "</div>";
        }

        code += '<div id="' + crypto + '" class="col-lg-8"><b>' + message.author + ':</b> ' + message.answer + '</div>' + '</div>';

        $("#chat").find("#fence").prepend(code);
    } else if (message.type === 'err') {
        document.getElementById(crypto).style.color = "red";
    } else if (message.type === 'succ') {
        document.getElementById(crypto).style.color = "green";
        if (message.UUID === UUID) {
            $("#winModal").modal('show');
        } else {
            $("#loseModal").modal('show');
        }
    } else if (message.type === 'refresh') {
        clearCanvas();
        alarm("bad");
    }
};
function clearCanvas() {
    var iframe = document.getElementById('canvasframe');
    iframe.src = iframe.src;}
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
    $("#hostModal").modal('show');
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

// client-only
var publishAttempt = function () {
    if (document.getElementById('author').value === '') {
        alert("Set your name!");
    }
    else if (document.getElementById('answer').value === '') {
        alert("Set your answer!");
    } else {
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

}

document.getElementById('refresh').addEventListener('click', clearCanvas, false);


if ($("#fence").data("param") === 'client') {
    document.getElementById('submit').addEventListener('click', publishAttempt);
    $("#answer").keyup(function (event) {
        if (event.keyCode === 13) {
            publishAttempt();
        }
    });
}
