var SnapKitIntegration = pc.createScript('snapKitIntegration');
SnapKitIntegration.attributes.add('html', {type: 'asset', assetType:'html', title: 'HTML Asset'});
SnapKitIntegration.attributes.add('css', {type: 'asset', assetType:'css', title: 'CSS Asset'});
SnapKitIntegration.attributes.add('devClientId', { type: 'string', default: '' });
SnapKitIntegration.attributes.add('devRedirectUrl', { type: 'string', default: '' });
SnapKitIntegration.attributes.add('prodClientId', { type: 'string', default: '' });
SnapKitIntegration.attributes.add('prodRedirectUrl', { type: 'string', default: '' });

// Stop this from being started multiple times in the event of
// a scene load for example
SnapKitIntegration.initialized = false;

// initialize code called once per entity
SnapKitIntegration.prototype.initialize = function() {
    if (SnapKitIntegration.initialized) {
        console.log('Snap Kit already initialized');
        return;
    }

    // Setup html and css for the snap-kit button
    var style = document.createElement('style');

    // Append to head
    document.head.appendChild(style);
    style.innerHTML = this.css.resource || '';

    // Add the HTML
    this.div = document.createElement('div');
    this.div.classList.add('container');
    this.div.innerHTML = this.html.resource || '';

    document.body.appendChild(this.div);

    // Hide the login button when ready
    this.app.on('sdk:loggedin', function(avatarId) {
        document.body.removeChild(this.div);
    }, this);

    // Check if we are running in a dev launch tab
    var windowUrl = window.location.href;
    if (windowUrl.startsWith('https://launch.playcanvas.com') || windowUrl.startsWith('http://launch.playcanvas.com')) {
        snapKitSetup(this.devClientId, this.devRedirectUrl, this.div);
    } else {
        snapKitSetup(this.prodClientId, this.prodRedirectUrl, this.div);
    }

    SnapKitIntegration.initialized = true;
};


var SnapKitBitmoji3dLoader = pc.createScript('snapKitBitmoji3dLoader');

// initialize code called once per entity
SnapKitBitmoji3dLoader.prototype.initialize = function() {
    var self = this;
    this._log = new Log('SnapKitBitmoji3dLoader');

    this.app.on('sdk:loggedin', function (avatarId) {
        self.entity.fire('bitmoji:bodyloading');
        snapKitFetchAvatar3D(avatarId, function (err, url) {
            loadBitmoji3d(url,
                function (err, asset) {
                    if (err) {
                        self._log.error('Error loading model');
                        self._log.error(err);
                    }
                    self.entity.fire('bitmoji:bodyloaded', asset);
                },
                function (err, faceTextures) {
                    if (err) {
                        self._log.error('Error loading face textures');
                        self._log.error(err);
                    }
                    self.entity.fire('bitmoji:facesloaded', faceTextures);
                }
            );
        });
    }, this);
};


var SnapKitBitmoji2dLoader = pc.createScript('snapKitBitmoji2dLoader');

// initialize code called once per entity
SnapKitBitmoji2dLoader.prototype.initialize = function() {
    var self = this;
    this.app.on('sdk:loggedin', function (avatarId) {
        snapKitFetchAvatar2D(avatarId, 'b711adf2-073e-4e13-ad64-27e54a0c2ea3', 1, function (err, url) {
            if (err) {
                console.error(err);
            } else {
                // Load as a texture asset
                self.app.assets.loadFromUrl(url, 'texture', function(err, asset) {
                    if (err) {
                        console.error(err);
                    } else {
                        self.entity.element.texture = asset.resource;
                    }
                });
            }
        });
    }, this);
};


//
// Snap Kit Integration code
(function () {
    var app = pc.Application.getApplication();
    var accessToken;
    var avatarId;

    // Function to setup snapkit in the canvas
    function setup (clientId, redirectUrl, snapkitDiv) {
        // Mount the button of snap-kit
        var button = snapkitDiv.querySelector('.button');
        window.snapKitInit = function () {
            var loginButtonIconId = 'my-login-button-target';
            // Mount Login Button
            // snap.loginkit
            snap.loginkit.mountButton(loginButtonIconId, {
                clientId: clientId,
                redirectURI: redirectUrl,
                scopeList: [
                    'user.display_name',
                    'user.bitmoji.avatar'
                ],
                // Fetch the 2d bitmoji icon and glb model with access token
                handleResponseCallback: function(resp) {
                    // console.log(resp['access_token']);
                    snap.loginkit.fetchUserInfo().then(function(data) {
                        console.log('User info:', data);
                    });

                    snap.loginkit.fetchBitmojiSelfieUrl().then(function(data) {
                        console.log('Bitmoji selfie info:', data);
                    }, function(err) {
                        console.log(err); // Error
                    });

                    accessToken = resp.access_token;
                    fetchAvatarId();
                },
            });
        };

        // Load the SDK asynchronously
        (function (d, s, id) {
            var js, sjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = 'https://sdk.snapkit.com/js/v1/login.js';
            sjs.parentNode.insertBefore(js, sjs);
        }(document, 'script', 'loginkit-sdk'));
    }


    // Fetch the avatar Id from graphQL and fetch 3d model
    function fetchAvatarId() {
        if (accessToken == null) {
            console.error('Snap access token not available');
            return;
        }

        var Http = new XMLHttpRequest();
        var url = 'https://api.snapkit.com/v1/me';
        var query = '{\'query\': \'{me{bitmoji{id}}}\'}';

        Http.open('POST', url, true);
        console.log('Snap access token: ' + accessToken);
        Http.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        Http.responseType = 'json';

        Http.onload = function(e) {
            if (this.status === 200) {
                avatarId = this.response.data.me.bitmoji.id;
                console.log('User avatar id: ' + avatarId);
                app.fire('sdk:loggedin', avatarId);
            } else {
                console.log(this.response, this.status);
            }
        };

        Http.send(query);
    }


    // Similar API to SnapCanvas API - variant is the template UUID
    // This method illustrates how to compose a public 2D Bitmoji URL
    function fetchAvatar2D(avatarId, variant, scale, callback) {
        var bitmojiBaseURL = 'https://images.bitmoji.com/render/panel/';
        var url = bitmojiBaseURL + variant + '-' + avatarId + '-v1.png?transparent=1&palette=1' + '&scale=' + scale;
        callback(null, url);
    }


    function fetchAvatar3D(avatarId, callback) {
        var Http = new XMLHttpRequest();
        var url = 'https://bitmoji.api.snapchat.com/bitmoji-for-games/model?avatar_id=' + avatarId + '&lod=3';
        Http.open('GET', url, true);
        Http.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        Http.responseType = 'arraybuffer';
        Http.onload = function(e) {
            if (this.status == 200) {
                callback(null, this.response);
            } else {
                callback(this.statusText);
            }
        };
        Http.send();
    }

    window.snapKitSetup = setup;
    window.snapKitFetchAvatar2D = fetchAvatar2D;
    window.snapKitFetchAvatar3D = fetchAvatar3D;
}());