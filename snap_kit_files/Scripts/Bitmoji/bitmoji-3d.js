/**
 * @event
 * @name Bitmoji3d#bitmoji:ready
 * @description Fired when the bitmoji has it's default assets ready.
 */

/**
 * @event
 * @name pc.Entity#bitmoji:bodyloading
 * @description Fired when loading a Bitmoji to be used by this pc.Entity (e.g from Snap Kit API).
 */

/**
 * @event
 * @name pc.Entity#bitmoji:bodyloaded
 * @param {pc.Asset} containerAsset The asset of type container which has the Bitmoji, materials, etc inside.
 * @description Fired when a Bitmoji has finished loading.
 */

/**
 * @event
 * @name pc.Entity#bitmoji:facesloaded
 * @param {pc.Asset[]} textureAssets An array of texture assets that have all the faces.
 * @description Fired when all the texture assets for the faces have been loaded.
 */

/**
 * @event
 * @name pc.Entity#bitmoji:body:changestate
 * @param {String} stateName The name of the state to change to (currently, it is the name of the animation asset).
 * @param {Number} fadeTime The time to blend between the current and requested state.
 * @description Fired to request a change of avatar state.
 */


var Bitmoji3d = pc.createScript('bitmoji3d');
Bitmoji3d.attributes.add('loadingIconEntity', {type: 'entity'});
Bitmoji3d.attributes.add('defaultBitmoji3dModelAsset', {type: 'asset'});
Bitmoji3d.attributes.add('defaultBitmoji3dMaterialAsset', {type: 'asset'});
Bitmoji3d.attributes.add('defaultAnimationAssets', {type: 'asset', array: true});


// Face animation ids
Bitmoji3d.faces = {
    win: "win",
    cheerful: "cheerful",
    determined: "determined",
    shocked: "shocked",
    scared: "scared",
    thinking: "thinking",
    compression: "compression",
    blink: "idle-blink",
    cheeky: 'cheeky',
    angry: 'angry',
    lose: 'lose',
    idle: 'idle'
};


// initialize code called once per entity
Bitmoji3d.prototype.initialize = function() {
    this._log = new Log('[Bitmoji3d]');

    this._faceTextureAssets = {};

    this._faceMaterial = null;
    this._currentFace = Bitmoji3d.faces.idle;

    this._currentAnimationAsset = null;

    // Use the placeholder bitmoji and animations
    if (DefaultGlbAssetLoader.ready) {
        this._onDefaultGlbAssetsLoaded();
    } else {
        this.app.once('defaultglbs:loaded', function() {
            this._onDefaultGlbAssetsLoaded();
        }, this);
    }

    // Listen for the event if a bitmoji is being loaded and finished
    this.entity.on('bitmoji:bodyloading', function () {
        this.loadingIconEntity.enabled = true;
    }, this);

    this.entity.on('bitmoji:bodyloaded', function (containerAsset) {
        // Find the material for the face
        this._faceMaterial = null;
        var resource = containerAsset.resource;
        var i;
        for (i = 0; i < resource.materials.length; ++i) {
            var materialAsset = resource.materials[i];
            if (materialAsset.resource.name == 'face_group_MAT') {
                this._faceMaterial = materialAsset.resource;
                break;
            }
        }

        this.entity.model.asset = resource.model;
        this.loadingIconEntity.enabled = false;
    }, this);

    this.entity.on('bitmoji:facesloaded', function (textureAssets) {
        this._faceTextureAssets = {};
        var textureAsset;
        // Map the texture assets to texture name
        for (var i = 0; i < textureAssets.length; ++i) {
            textureAsset = textureAssets[i];
            this._faceTextureAssets[textureAsset.name] = textureAsset;
        }

        this._changeFace(this._currentFace);
    }, this);

    // Listen for animation changes
    this.entity.on('bitmoji:body:changestate', function (stateName, fadeTime) {
        this._playAnimation(stateName, fadeTime);
    }, this);

    this.loadingIconEntity.enabled = false;
};


Bitmoji3d.prototype._onDefaultGlbAssetsLoaded = function() {
    var i;

    var defaultBitmojiContainerAsset = DefaultGlbAssetLoader.assets[this.defaultBitmoji3dModelAsset.id];
    if (defaultBitmojiContainerAsset == null) {
        this._log.error('Default Bitmoji3d model not ready');
    } else {
        this.entity.model.asset = defaultBitmojiContainerAsset.resource.model;
        var mi = this.entity.model.model.meshInstances;
        for (i = 0; i < mi.length; ++i) {
            mi[i].material = this.defaultBitmoji3dMaterialAsset.resource;
        }
    }

    var animationContainerAssets = this.defaultAnimationAssets;
    console.log(animationContainerAssets);
    var animationsAssets = [];
    for (i = 0; i < animationContainerAssets.length; ++i) {
        // Assume that there is only one in each container
        var containerAsset = DefaultGlbAssetLoader.assets[animationContainerAssets[i].id];
        if (containerAsset == null) {
            this._log.error('Animation ' + animationContainerAssets[i].name + ' not ready');
        } else {
            animationsAssets.push(containerAsset.resource.animations[0]);
        }
    }

    this.entity.animation.assets = animationsAssets;

    if (animationsAssets.length > 0) {
        this._playAnimation(animationsAssets[0].name);
    }

    this.entity.fire('bitmoji:ready');
};


Bitmoji3d.prototype._changeFace = function (faceName) {
    if (this._faceMaterial) {
        var faceTextureAsset = this._faceTextureAssets[faceName];
        if (faceTextureAsset) {
            this._faceMaterial.diffuseMap = faceTextureAsset.resource;
            this._faceMaterial.update();
        } else {
            this._log.error('Missing face texture: ' + faceName);
        }
    }

    this._currentFace = faceName;
};


Bitmoji3d.prototype._playAnimation = function (animName, fadeTime) {
    this.entity.animation.play(animName, fadeTime);

    var animationAssets = this.entity.animation.assets;
    for (var i = 0; i < animationAssets.length; ++i) {
        var asset = animationAssets[i];
        if (asset.name === animName) {
            this._currentAnimationAsset = asset;
        }
    }
};


Bitmoji3d.prototype._updateFaces = function (dt) {
    // Get the current animation asset being used
    var facialSwaps;

    var animationAsset = this._currentAnimationAsset;
    if (animationAsset && animationAsset.resource) {
        facialSwaps = animationAsset.resource.facialSwaps;
    }

    // Got through all the key times to work out which face expression to use
    // and swap to
    if (facialSwaps) {
        var currentTime = this.entity.animation.currentTime;
        var times = facialSwaps.times;
        var faceIndex = 0;
        for (var i = 0; i < times.length; ++i) {
            if (currentTime >= times[i]) {
                faceIndex = i;
            }
        }

        var faceName = facialSwaps.expressions[faceIndex];
        if (this._currentFace != faceName) {
            this._changeFace(faceName);
        }
    }
};


Bitmoji3d.prototype.update = function (dt) {
    this._updateFaces(dt);
};

// swap method called for script hot-reloading
// inherit your script state here
// Bitmoji3d.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/