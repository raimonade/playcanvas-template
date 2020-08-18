/**
 * @event
 * @name pc.Application#defaultglbs:loaded
 * @description Fired when the GLBs in DefaultGlbAssetLoader#assets have finished loaded and process to containerAssets.
 */

// TODO When JSON attributes are available, turn this into a struct with a tick box to say
// whether it is a bitmoji asset or not
var DefaultGlbAssetLoader = pc.createScript('defaultGlbAssetLoader');
DefaultGlbAssetLoader.attributes.add('assets', { type: 'asset', array: true });
DefaultGlbAssetLoader.attributes.add('bitmojiAnimationAssets', { type: 'asset', array: true });

DefaultGlbAssetLoader.initialized = false;
DefaultGlbAssetLoader.ready = false;

// Map the original GLB asset ids to the new container assets
DefaultGlbAssetLoader.assets = {};

// initialize code called once per entity
DefaultGlbAssetLoader.prototype.initialize = function () {
	// Only do this once
	if (DefaultGlbAssetLoader.initialized) {
		console.log('Default GLB assets already loaded');
		return;
	}

	this._assetsLoaded = 0;

	var self = this;

	var fireEventIfFinished = function () {
		if (self.assets.length + self.bitmojiAnimationAssets.length == self._assetsLoaded) {
			DefaultGlbAssetLoader.ready = true;
			self.app.fire('defaultglbs:loaded');
		}
	};

	var loadGlbAsset = function (asset) {
		var id = asset.id;

		utils.loadGlbContainerFromAsset(asset, null, asset.name, function (err, asset) {
			if (err) {
				console.error(err);
			} else {
				DefaultGlbAssetLoader.assets[id] = asset;
			}

			self._assetsLoaded += 1;
			fireEventIfFinished();
		});
	};

	var loadBitmojiGlbAsset = function (asset) {
		var id = asset.id;
		loadBitmojiAnimation3d(asset.resource, asset.name, function (err, asset) {
			if (err) {
				console.error(err);
			} else {
				DefaultGlbAssetLoader.assets[id] = asset;
			}
			self._assetsLoaded += 1;
			fireEventIfFinished();
		});
	};

	var i, asset;

	// Load the assets that are not ready
	for (i = 0; i < this.assets.length; ++i) {
		asset = this.assets[i];
		if (asset.loaded) {
			loadGlbAsset(asset);
		} else {
			asset.once('load', function (asset) {
				loadGlbAsset(asset);
			});
			this.app.assets.load(asset);
		}
	}

	for (i = 0; i < this.bitmojiAnimationAssets.length; ++i) {
		asset = this.bitmojiAnimationAssets[i];
		if (asset.loaded) {
			loadBitmojiGlbAsset(asset);
		} else {
			asset.once('load', function (asset) {
				loadBitmojiGlbAsset(asset);
			});
			this.app.assets.load(asset);
		}
	}

	DefaultGlbAssetLoader.initialized = true;
	fireEventIfFinished();
};
