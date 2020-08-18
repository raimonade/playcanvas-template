class BallController extends pc.ScriptType {
	private _direction: string = 'left';
	private _playingField: pc.Entity;
	private vSpeed: number = 3;
    private hSpeed: number = 3;
    private _defaultPos: pc.Vec3;

	public initialize() {
        this._playingField = this.app.root.findByName('PlayingField') as pc.Entity;
        this._defaultPos = this.entity.getPosition().clone();
        console.log(this._playingField);
        this.app.on('game:reset', this.resetPosition, this);
        
		this.shootBall();
	}

	private shootBall() {
		// if(newPos.y + this.entity.getLocalScale().z / 2 >= this._playingField.)
	}

	public update(dt: number) {
        const newPos = this.entity.getPosition();
        const playingFieldScale = this._playingField.getLocalScale();

        if(newPos.y + this.entity.getLocalScale().z / 2 >= playingFieldScale.z / 2 ||
        newPos.y - this.entity.getLocalScale().z / 2 <= -playingFieldScale.z / 2) {
          this.vSpeed *= -1;
      }
      
      if(newPos.x + this.entity.getLocalScale().x / 2 >= playingFieldScale.x / 2) {
          this.hSpeed *= -1;
          console.log('right goal');
          this.resetPosition();
          this.app.fire('game:goal', 'right');
          return;
      }
      
      if(newPos.x - this.entity.getLocalScale().x / 2 <= -playingFieldScale.x / 2) {
          this.hSpeed *= -1;
          console.log('left goal');
          this.resetPosition();
          this.app.fire('game:goal', 'left');
          return;
      }
      
      newPos.x += this.hSpeed * dt;
      newPos.y += this.vSpeed * dt;
      
      this.entity.setPosition(newPos);
    }

    public resetPosition(){
        console.log(this._defaultPos);
        this.entity.setPosition(this._defaultPos);
        this.vSpeed = 1;
        this.hSpeed = 3;
    }
    
    public flipX() {
        this.hSpeed *= -1;
    };
    
    public flipY() {
        this.vSpeed *= -1;
    };

}

pc.registerScript(BallController, 'BallController');
