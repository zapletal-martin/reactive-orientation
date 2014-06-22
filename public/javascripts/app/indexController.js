(function() {
    App.IndexController = Ember.ArrayController.extend({
        appName: 'My First Example',
        content: Ember.A(),
        serverEndpointAddress: "ws://".concat(document.location.host,"/dashboardWebSocket"),
        socket: {},

        init: function() {
            var self = this;
            self.removeUnusedDevicesTimer();

            self.set("socket",new WebSocket(self.serverEndpointAddress));

            self.socket.onmessage = function(event) {
                self.handleWebSocketReceivedMessage(event);
            };
            self.socket.onclose = function(event) {
                console.log("Socket closed");
                self.set("socket",new WebSocket(self.serverEndpointAddress));
            }
            self.socket.onopen = function(event) {
                console.log("Socket opened");
            }

        },

        removeUnusedDevicesTimer: function () {
            function deviceDataUpdatedInSeconds(device, seconds) {
                return (new Date().getTime() - seconds * 1000) < device.get('updated');
            }

            var self = this;
            Ember.run.later(this, function() {
                self.store.all('device').forEach(function(device) {
                    if(!deviceDataUpdatedInSeconds(device, 2)) {
                        //self.get('content').removeObject(device);
                    }
                });

                this.removeUnusedDevicesTimer();
            }, 1000);
        },

        handleWebSocketReceivedMessage: function(event) {
            var self = this;
            var json = JSON.parse(event.data);

            if(self.store.hasRecordForId('device', json.id)) {
                self.store.find('device', json.id).then(function(device) {
                    DeviceService.update(device, json);

                    if(!alreadyExists(device.renderer)) {
                        var canvas = document.getElementById('canvas' + device.id);

                        if(canvasAlreadyRendered(canvas)) {
                            var renderer = Orientation.createCanvas(device.get('cube'));
                            device.set('renderer', renderer);

                            try {
                                canvas.appendChild(renderer.domElement)
                            } catch (e) {
                                //self.get('content').removeObject(device);
                            }
                        }
                    }
                });
            } else {
                DeviceService.create(self.store, json)
            }

            function alreadyExists(obj) {
                return obj !== undefined;
            }

            function canvasAlreadyRendered(canvas) {
                return alreadyExists(canvas);
            }
        }
    });
})();
