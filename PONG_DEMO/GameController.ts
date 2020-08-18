class GameController extends pc.ScriptType {
	public playerSpeed: number;
	public scoreMax: number;

	public initialize() {
        this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
        
        this.on('destroy', () => {
            this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
        });
    }
    
    private onKeyDown(e:pc.KeyboardEvent){
        if(e.key === pc.KEY_P){
            console.log('pause');
            this.app.fire('game:pause');
        }

        if(e.key === pc.KEY_R){
            console.log('reset');
            this.app.fire('game:reset');
        }

        if(e.key === pc.KEY_E){
            this.app.fire('game:postprocessing');
        } 
    }
}

pc.registerScript(GameController, 'GameController');

GameController.attributes.add('playerSpeed', {
	type: 'number',
	default: 1,
	title: 'Player Speed',
	description: 'Player Movement Speed Modifier',
});

GameController.attributes.add('scoreMax', {
	type: 'number',
	default: 6,
	title: 'Score Max',
	description: 'At which score point should game end',
});
