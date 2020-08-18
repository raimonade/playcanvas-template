class MouseInput extends pc.ScriptType {
	
public fromWorldPoint: pc.Vec3 = new pc.Vec3();
public toWorldPoint: pc.Vec3 = new pc.Vec3();
public worldDiff: pc.Vec3 = new pc.Vec3();
public orbitCamera: OrbitCamera;
public lastPoint:pc.Vec2 = new pc.Vec2();
public lookButtonDown:boolean = false;
public panButtonDown:boolean = false;
public distanceSensitivity:number;
public orbitSensitivity:number;

// initialize code called once per entity
public initialize() {
    this.orbitCamera = this.entity.script['OrbitCamera'] as OrbitCamera;
        
    if (this.orbitCamera) {
        var self = this;
        
        var onMouseOut = function (e) {
           self.onMouseOut(e);
        };
        
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

        // Listen to when the mouse travels out of the window
        window.addEventListener('mouseout', onMouseOut, false);
        
        // Remove the listeners so if this entity is destroyed
        this.on('destroy', function() {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

            window.removeEventListener('mouseout', onMouseOut, false);
        });
    }
    
    // Disabling the context menu stops the browser displaying a menu when
    // you right-click the page
    this.app.mouse.disableContextMenu();
};

public pan (screenPoint) {
    var fromWorldPoint = this.fromWorldPoint;
    var toWorldPoint = this.toWorldPoint;
    var worldDiff = this.worldDiff;
    
    // For panning to work at any zoom level, we use screen point to world projection
    // to work out how far we need to pan the pivotEntity in world space 
    var camera = this.entity.camera;
    var distance = this.orbitCamera.distance;
    
    camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);
    camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint);

    worldDiff.sub2(toWorldPoint, fromWorldPoint);
       
    this.orbitCamera.pivotPoint.add(worldDiff);    
};


public onMouseDown(e){
    switch (e.button) {
        case pc.MOUSEBUTTON_LEFT: {
            this.lookButtonDown = true;
        } break;
            
        case pc.MOUSEBUTTON_MIDDLE: 
        case pc.MOUSEBUTTON_RIGHT: {
            this.panButtonDown = true;
        } break;
    }
};


public onMouseUp(e){
    switch (e.button) {
        case pc.MOUSEBUTTON_LEFT: {
            this.lookButtonDown = false;
        } break;
            
        case pc.MOUSEBUTTON_MIDDLE: 
        case pc.MOUSEBUTTON_RIGHT: {
            this.panButtonDown = false;            
        } break;
    }
};


public onMouseMove(e){    
    var mouse = this.app.mouse;
    if (this.lookButtonDown) {
        this.orbitCamera.pitch -= e.dy * this.orbitSensitivity;
        this.orbitCamera.yaw -= e.dx * this.orbitSensitivity;
        console.log(this.orbitCamera.yaw)
    } else if (this.panButtonDown) {
        this.pan(e);   
    }
    
    this.lastPoint.set(e.x, e.y);
};


public onMouseWheel(e){
    this.orbitCamera.distance -= e.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1);
    e.event.preventDefault();
};


public onMouseOut(e){
    this.lookButtonDown = false;
    this.panButtonDown = false;
};

}

MouseInput.attributes.add('orbitSensitivity', {
    type: 'number', 
    default: 0.3, 
    title: 'Orbit Sensitivity', 
    description: 'How fast the camera moves around the orbit. Higher is faster'
});

MouseInput.attributes.add('distanceSensitivity', {
    type: 'number', 
    default: 0.15, 
    title: 'Distance Sensitivity', 
    description: 'How fast the camera moves in and out. Higher is faster'
});

pc.registerScript(MouseInput, 'MouseInput');
