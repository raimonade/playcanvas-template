class AiPlayerController extends pc.ScriptType {
	// initialize code called once per entity
	private ballEntity: pc.Entity;

	public initialize() {
		this.ballEntity = this.app.root.findByName('Ball') as pc.Entity;

		this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
	}

	
	// update code called every frame
	public update(dt:number){
		var pos = this.entity.getPosition();
		pos.y = this.ballEntity.getPosition().y;
		const playingField = this.app.root.findByName('PlayingField') as pc.Entity;
		const playingFieldScale = playingField.getLocalScale();
		let ownHalfScale = this.entity.getLocalScale().z / 2;

		if (pos.y + ownHalfScale >= playingFieldScale.z / 2 || pos.y - ownHalfScale <= -playingFieldScale.z / 2) {
			return;
		}
		this.entity.setPosition(pos);
	}

	public onTriggerEnter = (entity) => {
		console.log('triggerenter');
		
		var ball = entity.script.BallController;
		if (ball) {
			ball.flipX();
		}
	}
}

pc.registerScript(AiPlayerController, 'AiPlayerController');
