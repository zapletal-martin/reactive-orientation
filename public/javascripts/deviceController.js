App.DeviceController = Ember.ObjectController.extend({
    appName: 'My First Example',
    startOn: false,
    socket: {},
    orientation: {},

    init: function() {
        this.registerListeners();
        this.set('socket', new WebSocket('ws://192.168.0.15:9000/mobileWebSocket'))
    },

    actions: {
        start: function() {
            this.set('startOn', true);
        },

        stop: function() {
            this.set('startOn', false);
        }
    },

    registerListeners: function() {
        var self = this;
        if(window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function(event) {
                if (self.get("startOn")) {
                    var orientationData = Orientation.calculateEulerOrientationForDevice(event);
                    var orientation =  { device: "Nexus 7", data: orientationData }
                    self.set('orientation', orientation);
                    self.socket.send(JSON.stringify(orientation));
                }
            }, false);
        }
    }
});