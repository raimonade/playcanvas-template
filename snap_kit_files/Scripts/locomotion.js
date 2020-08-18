var Locomotion = pc.createScript('locomotion');

Locomotion.attributes.add('fadeTime', { type: 'number', default: 0.2 });

// initialize code called once per entity
Locomotion.prototype.initialize = function() {
    // Wait till the bitmoji is ready as we are loading the assets
    // at runtime rather than preload time
    this._ready = false;

    this.entity.on('bitmoji:ready', function() {
        this.startPos = this.entity.getPosition().clone();
        this.targetPos = this.entity.getPosition().clone();
        this.timeToTarget = 0;

        var forward = this.entity.forward.clone().scale(-1);
        this.startAngle = Math.atan2(forward.x, forward.z);
        this.targetAngle = Math.atan2(forward.x, forward.z);
        this.timeToTurn = 0;

        this.duration = 0;
        this.running = false;

        this.entity.on('runto', function (pos) {
            this.startPos = this.entity.getPosition().clone();
            this.targetPos.copy(pos);

            var temp = new pc.Vec3();
            temp.sub2(this.targetPos, this.startPos);

            var distance = temp.length();
            if (distance > 0.5) {
                this.duration = this.timeToTarget = distance / 3;

                if (!this.running) {
                    this.entity.fire('bitmoji:body:changestate', 'run.glb', this.fadeTime);
                    this.running = true;
                }

                forward = this.entity.forward.clone().scale(-1);
                this.startAngle = Math.atan2(forward.x, forward.z);
                this.targetAngle = Math.atan2(temp.x, temp.z);
                this.timeToTurn = 0.3;
            }
        }, this);

        this._ready = true;
    }, this);


};

// update code called every frame
Locomotion.prototype.update = function(dt) {
    if (this._ready) {
        if (this.running && this.timeToTarget >= 0 && this.timeToTarget - dt < 0) {
            this.entity.fire('bitmoji:body:changestate', 'Dance01.glb', this.fadeTime);
            this.running = false;
        }

        this.timeToTarget -= dt;
        this.timeToTurn -= dt;

        if (this.timeToTarget > 0) {
            var pos = new pc.Vec3();
            pos.lerp(this.startPos, this.targetPos, 1 - this.timeToTarget / this.duration);
            this.entity.setPosition(pos);
            this.app.fire('playermove', pos);

            if (this.timeToTurn > 0) {
                var angle = pc.math.lerpAngle(this.startAngle * pc.math.RAD_TO_DEG, this.targetAngle * pc.math.RAD_TO_DEG, 1 - this.timeToTurn / 0.4);
                this.entity.setEulerAngles(0, angle, 0);
            }
        }
    }
};
