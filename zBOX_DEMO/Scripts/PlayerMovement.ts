class PlayerMovement extends pc.ScriptType {
	public camera: pc.Entity;
	private cameraScript;
	public movementSpeed: number;
	public jumpHeight: number;
	public orbitCamera: OrbitCamera;
	private eulers: pc.Vec3;

	public initialize(): void {
        this.camera = this.app.root.findByName('Camera') as pc.Entity;
		this.orbitCamera = this.camera.script['OrbitCamera'] as OrbitCamera;
		this.eulers = new pc.Vec3();
		// this.cameraScript = this.camera.script.get('CameraMovement');
	}

	public update(dt: number): void {
		const forward = this.entity.forward.clone();
		const right = this.entity.right;
		let x = 0;
		let y = 0;

		var horizontalForce = this.entity.up.clone();
		var verticalForce = this.entity.right.clone();

		if (this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
			this.entity.rigidbody.applyTorque(horizontalForce.scale(-this.movementSpeed * 10));
		}

		if (this.app.keyboard.isPressed(pc.KEY_LEFT)) {
			this.entity.rigidbody.applyTorque(horizontalForce.scale(this.movementSpeed * 10));
		}

		if (this.app.keyboard.isPressed(pc.KEY_UP)) {
			// this.entity.rigidbody.applyTorque(verticalForce.scale(-6));
			this.entity.rigidbody.applyImpulse(forward.scale(this.movementSpeed));
		}

		if (this.app.keyboard.isPressed(pc.KEY_DOWN)) {
			// this.entity.rigidbody.applyTorque(verticalForce.scale(6));
			this.entity.rigidbody.applyImpulse(forward.scale(-this.movementSpeed));
		}
		if (this.app.keyboard.isPressed(pc.KEY_SPACE)) {
			this.entity.rigidbody.applyImpulse(0, 1, 0);
		}
		
		if (this.app.keyboard.isPressed(pc.KEY_F)) {
            this.focusCamera();
		}

		if (this.app.keyboard.isPressed(pc.KEY_R)) {
			this.entity.rigidbody.teleport(0, 2, 0, 0, 0, 0);
			this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
            this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;
            this.focusCamera();
		}
    }
    
    private focusCamera(){
        this.orbitCamera.forceLook(this.entity.getRotation());
        this.orbitCamera.focus(this.entity);
    }

}

pc.registerScript(PlayerMovement, 'PlayerMovement');

PlayerMovement.attributes.add('movementSpeed', {
	type: 'number',
	default: 0.2,
	description: 'Controls player movement speed',
});
PlayerMovement.attributes.add('jumpHeight', {
	type: 'number',
	default: 400,
	description: 'Controls player jump height',
});
