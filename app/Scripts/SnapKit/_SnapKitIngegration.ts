class SnapKitIntegration extends pc.ScriptType {
	// Stop this from being started many times in the event
	// of a scene load for example
	private initialized: boolean = false;
	public devClientId: string;
	public devRedirectUrl: string;
	public prodClientId: string;
	public prodRedirectUrl: string;
	public css: pc.Asset;
	public html: pc.Asset;

	public div: HTMLElement;

	public initialize(): void {
		if (this.initialized) {
			console.log('Snap Kit already running');
			return;
		}

		// Set up html and css for the snap-kit login button
		const style = document.createElement('style');

		// append to head
		document.head.appendChild(style);
		style.innerHTML = this.css.resource || '';

		// Add the HTML
		this.div = document.createElement('div');
		this.div.classList.add('container');
		this.div.innerHTML = this.html.resource || '';

		document.body.appendChild(this.div);

		// Hide the login button when ready
		this.app.on('sdk:loggedin', (avatarId) => {
			document.body.removeChild(this.div);
		});

		// Check if we are running in a dev launch tab
		const windowUrl = window.location.href;
		if (
			windowUrl.startsWith('https://launch.playcanvas.com') ||
			windowUrl.startsWith('http://launch.playcanvas.com')
		) {
			// @ts-ignore

			snapKitSetup(this.devClientId, this.devRedirectUrl, this.div);
		} else {
			// @ts-ignore

			snapKitSetup(this.prodClientId, this.devRedirectUrl, this.div);
		}

		this.initialized = true;
	}
}

pc.registerScript(SnapKitIntegration, 'SnapKitIntegration');

SnapKitIntegration.attributes.add('html', {
	type: 'asset',
	assetType: 'html',
	title: 'HTML asset',
});

SnapKitIntegration.attributes.add('css', {
	type: 'asset',
	assetType: 'css',
	title: 'CSS asset',
});

SnapKitIntegration.attributes.add('devClientId', { type: 'string', default: '' });
SnapKitIntegration.attributes.add('devRedirectUrl', { type: 'string', default: '' });
SnapKitIntegration.attributes.add('prodClientId', { type: 'string', default: '' });
SnapKitIntegration.attributes.add('prodRedirectUrl', { type: 'string', default: '' });

class SnapKitBitmoji3dLoader extends pc.ScriptType {
	private _log: any;

	public initialize(): void {
		const self = this;

		this.app.on(
			'sdk:loggedin',
			(avatarId) => {
				this.entity.fire('bitmoji:bodyloading');
				// @ts-ignore

				snapKitFetchAvatar3D(avatarId, (err, url) => {
					// @ts-ignore

					loadBitmoji3d(
						url,
						(err, asset) => {
							if (err) {
								console.error('Error Loading Model');
								console.error('Error Loading Model');
							}
							self.fire('bitmoji:bodyloaded', asset);
						},
						(err, faceTextures) => {
							if (err) {
								console.error('Error loading face textures');
								console.error(err);
							}
							self.entity.fire('bitmoji:facesloaded', faceTextures);
						}
					);
				});
			},
			this
		);
	}
}

pc.registerScript(SnapKitBitmoji3dLoader, 'SnapKitBitmoji3dLoader');

class SnapKitBitmoji2dLoader extends pc.ScriptType {
	// initialize code called once per entity
	public initialize(): void {
		const self = this;
		this.app.on('sdk:loggedin', (avatarId) => {
			// @ts-ignore

			snapKitFetchAvatar2d(avatarId, 'b711adf2-073e-4e13-ad64-27e54a0c2ea3', 1, (err, url) => {
				if (err) {
					console.error(err);
				} else {
					// Load as a texture asset
					self.app.assets.loadFromUrl(url, 'texture', (err, asset) => {
						if (err) {
							console.error(err);
						} else {
							self.entity.element.texture = asset.resource;
						}
					});
				}
			});
		});
	}
}

pc.registerScript(SnapKitBitmoji2dLoader, 'SnapKitBitmoji2dLoader');

// Snap Kit Integration code
(function () {
	var app = pc.Application.getApplication();
	var accessToken;
	var avatarId;

	// Function to setup snapkit in the canvas
	function setup(clientId, redirectUrl, snapkitDiv) {
		// Mount the button of snap-kit
		var button = snapkitDiv.querySelector('.button');
		// @ts-ignore
		window.snapKitInit = function () {
			var loginButtonIconId = 'my-login-button-target';
			// Mount Login Button
			// snap.loginkit
			// @ts-ignore
			snap.loginkit.mountButton(loginButtonIconId, {
				clientId: clientId,
				redirectURI: redirectUrl,
				scopeList: ['user.display_name', 'user.bitmoji.avatar'],
				// Fetch the 2d bitmoji icon and glb model with access token
				handleResponseCallback: function (resp) {
					// console.log(resp['access_token']);
					// @ts-ignore
					snap.loginkit.fetchUserInfo().then(function (data) {
						console.log('User info:', data);
					});
					// @ts-ignore
					snap.loginkit.fetchBitmojiSelfieUrl().then(
						function (data) {
							console.log('Bitmoji selfie info:', data);
						},
						function (err) {
							console.log(err); // Error
						}
					);

					accessToken = resp.access_token;
					fetchAvatarId();
				},
			});
		};

		// Load the SDK asynchronously
		(function (d, s, id) {
			var js,
				sjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s);
			js.id = id;
			js.src = 'https://sdk.snapkit.com/js/v1/login.js';
			sjs.parentNode.insertBefore(js, sjs);
		})(document, 'script', 'loginkit-sdk');
	}

	// Fetch the avatar Id from graphQL and fetch 3d model
	function fetchAvatarId() {
		if (accessToken == null) {
			console.error('Snap access token not available');
			return;
		}

		var Http = new XMLHttpRequest();
		var url = 'https://api.snapkit.com/v1/me';
		var query = "{'query': '{me{bitmoji{id}}}'}";

		Http.open('POST', url, true);
		console.log('Snap access token: ' + accessToken);
		Http.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		Http.responseType = 'json';

		Http.onload = function (e) {
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
		Http.onload = function (e) {
			if (this.status == 200) {
				callback(null, this.response);
			} else {
				callback(this.statusText);
			}
		};
		Http.send();
	}
	// @ts-ignore
	window.snapKitSetup = setup;
	// @ts-ignore
	window.snapKitFetchAvatar2D = fetchAvatar2D;
	// @ts-ignore
	window.snapKitFetchAvatar3D = fetchAvatar3D;
})();
