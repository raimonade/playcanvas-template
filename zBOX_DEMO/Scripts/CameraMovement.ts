class CameraMovement extends pc.ScriptType {
    private rayEnd: pc.GraphNode;
    private eulers: pc.Vec3;
    public mouseSpeed: number;

    public initialize(): void {
        this.eulers = new pc.Vec3();
        this.app.mouse.on('mousemove', this.onMouseMove, this);
        this.app.mouse.on('mousedown', this.onMouseDown, this);

        this.rayEnd = this.app.root.findByName('RaycastEndPoint');
    }

    public postUpdate(dt: number): void {
        const originEntity = this.entity.parent;
        const targetY = this.eulers.x + 180;
        const targetX = this.eulers.y;
        const targetAng = new pc.Vec3(-targetX, targetY, 0);
        originEntity.setEulerAngles(targetAng);
        this.entity.setPosition(this.getWorldPoint());
        this.entity.lookAt(originEntity.getPosition());
    }

    private onMouseMove(e: pc.MouseEvent): void {
        if (pc.Mouse.isPointerLocked()) {
            this.eulers.x -= ((this.mouseSpeed * e.dx) / 60) % 360;
            this.eulers.y -= ((this.mouseSpeed * e.dy) / 60) % 360;

            if (this.eulers.x < 0) this.eulers.x += 360;
            if (this.eulers.y < 0) this.eulers.y += 360;
        }
    };

    private onMouseDown(): void {
        this.app.mouse.enablePointerLock();
    };

    private getWorldPoint(): pc.Vec3 {
        const from: pc.Vec3 = this.entity.parent.getPosition();
        const to: pc.Vec3 = this.rayEnd.getPosition();

        const hit: pc.RaycastResult = this.app.systems.rigidbody.raycastFirst(from, to);

        return hit ? hit.point : to;
    }

};

pc.registerScript(CameraMovement, 'CameraMovement');

CameraMovement.attributes.add('mouseSpeed', {
    type: 'number',
    default: 1.4,
    min: 0.01,
    max: 10,
    description: "Mouse Sensitivity"
});
