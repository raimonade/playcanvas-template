var Controls = pc.createScript('controls');

pc.Ray.prototype.intersectPlane = function (pos, normal) {
    if (this.direction.dot(normal) === 0) {
        return pc.Vec3.ZERO;
    }
    var t = normal.clone().scale(-1).dot(this.origin.clone().sub(pos)) / this.direction.dot(normal);
    return this.origin.clone().add(this.direction.clone().scale(t));
};

// initialize code called once per entity
Controls.prototype.initialize = function() {
    this.cameraEntity = this.app.root.findByName('Camera');

    this.eye = this.cameraEntity.getPosition();

    this.app.mouse.on('mousedown', function (e) {
        var dir = this.cameraEntity.camera.screenToWorld(e.x, e.y, 1);
        dir.sub(this.eye);

        var ray = new pc.Ray(this.eye, dir);

        var pos = ray.intersectPlane(pc.Vec3.ZERO, pc.Vec3.UP);
        if (pos.x < 4 && pos.x > -4 && pos.z < 4 && pos.z > -4) {
            this.entity.fire('runto', pos);
        }
    }, this);
};