var pubnub = PUBNUB.init({
    publish_key: 'pub-c-ccca9b35-6dce-48e8-8b92-a19ba6376d04',
    subscribe_key: 'sub-c-673b9e80-6787-11e4-814d-02ee2ddab7fe',
    leave_on_unload : true
});

var sum = 0;
var list = [];
for (var i = 1; i <= 1000; i++) {
    pubnub.subscribe({
        channel: 'croc-chat' + i,
        presence: function(m){
            if (m.occupancy > 0) {
                list.push({host: i, viewers: m.occupancy});
            };
            alert("woo hoo" + i);
        }
    });
}

var str = "<table class='table table-striped'><thead><tr><td>Host ID</td><td>Viewers</td><td></td></tr></thead>";
for (var i = 0; i < list.length; i++) {
    var pair = list[i];
    str += "<tr><td>" + pair.host + "</td><td>" + pair.viewers + "</td><td>" +
    "<a href='croc-host.html?host=" + pair.host + "' class='btn btn-sample'>Join</a></td></tr>";
}
str += "</table>";
$("#channels").innerHTML = str;
