var pubnub = PUBNUB.init({
    publish_key: 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
    subscribe_key: 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe',
    leave_on_unload : true
});

pubnub.subscribe({
    channel: 'croc-lobby',
    callback: function(m) {
        var host = m.host;
        var code = '<p><b>Player on host ' + host.toString() + ' is ready to play. </b>' +
            '<a href="croc-client.html?host=' + host.toString() + ' role="button" class="btn btn-sample">Join</a></p>';
        $("#channels").append(code);
    }
})