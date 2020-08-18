var CoinManager = pc.createScript('coinManager');

CoinManager.attributes.add('speed', { type: 'number', default: 1 });
CoinManager.attributes.add('bounceHeight', { type: 'number', default: 0.08 });
CoinManager.attributes.add('bounceSpeed', { type: 'number', default: 4 });

// initialize code called once per entity
CoinManager.prototype.initialize = function() {
    this.totalTime = 0;
    this.rotation = 0;

    this.player = this.app.root.findByName('Player');
};

// update code called every frame
CoinManager.prototype.update = function(dt) {
    this.totalTime += dt;

    var temp = new pc.Vec2();
    var playerPos = this.player.getPosition();
    var playerPos2d = new pc.Vec2(playerPos.x, playerPos.z);
    var coinPos2d = new pc.Vec2();

    this.rotation += this.speed;

    this.entity.findByTag('coin').forEach(function (coin) {
        if (!coin.startingY) {
            coin.startingY = coin.getLocalPosition().y;
        }

        coin.setEulerAngles(0, this.rotation, 0);
        var localPos = coin.getLocalPosition();
        coin.setLocalPosition(localPos.x, coin.startingY + this.bounceHeight * Math.sin(this.totalTime * this.bounceSpeed), localPos.z);

        var coinPos = coin.getPosition();
        coinPos2d.set(coinPos.x, coinPos.z);
        temp.sub2(coinPos2d, playerPos2d);
        var distSq = temp.lengthSq();
        if (distSq < 0.5 * 0.5) {
            this.app.fire('playeffect', 'CoinCollect', coinPos);
            this.player.fire('bitmoji:face:change', Bitmoji3d.faces.cheerful, 1);
            coin.destroy();
        }
    }.bind(this));
};

// swap method called for script hot-reloading
// inherit your script state here
// CoinManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/