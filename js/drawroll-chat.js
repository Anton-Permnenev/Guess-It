var chat_channel = 'drawroll-chat';

var pubnub = PUBNUB.init({
    publish_key: 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
    subscribe_key: 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe'
});

pubnub.subscribe({
    channel: chat_channel,
    callback: insertIntoChat
});

function insertIntoChat(message) {
    var code = '<p><b>' + message.author + ':</b> ' + message.answer + '</p>';
    $("#chat").find("#fence").prepend(code);
};

document.getElementById('submit').addEventListener('click', function() {
    pubnub.publish({
        channel: chat_channel,
        message: {
            author: document.getElementById('author').value,
            answer: document.getElementById('answer').value
        }
    });
});

