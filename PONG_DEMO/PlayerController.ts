class PlayerController extends pc.ScriptType {
	private cameraEntity;
	private _defaultPos: pc.Vec3;
	private _score: number;

	public initialize() {
		// this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
		this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
        this._defaultPos = this.entity.getPosition().clone();
		this.app.on('game:goal', this.onScored, this);
		this.app.on('game:reset', this.reset, this);
	}

	public update(dt: number) {
		const depth = 1;
		const playingField = this.app.root.findByName('PlayingField') as pc.Entity;
		const playingFieldScale = playingField.getLocalScale();
		let ownHalfScale = this.entity.getLocalScale().z / 2;
		const position = this.entity.getPosition();

		if (this.app.keyboard.isPressed(pc.KEY_W)) {
			let vector = new pc.Vec3(0, 0.1, 0);
			let pos = position.add(vector);
			if (pos.y + ownHalfScale >= playingFieldScale.z / 2) {
				return;
			}
			this.entity.setPosition(position.add(vector));
		}

		if (this.app.keyboard.isPressed(pc.KEY_S)) {
			let vector = new pc.Vec3(0, -0.1, 0);
			let pos = position.add(vector);
			if (pos.y - ownHalfScale <= -playingFieldScale.z / 2) {
				return;
			}
			this.entity.setPosition(position.add(vector));
		}

		// Finally update the cube's world-space position
		// this.entity.setPosition(newPos);
	}
	private onScored(side: string) {
		if (side === 'left') {
            this._score++;
		this.entity.setPosition(this._defaultPos);
        };
        console.log('SCORE: ' + this._score)
	}
	private reset() {
        this.entity.setPosition(this._defaultPos);
        this._score = 0;
	}

	private onTriggerEnter(entity) {
		var ball = entity.script.BallController;
		if (ball) {
			ball.flipX();
		}
	}
}

pc.registerScript(PlayerController, 'PlayerController');
