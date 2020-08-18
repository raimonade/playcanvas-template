var EffectManager = pc.createScript('effectManager');

// initialize code called once per entity
EffectManager.prototype.initialize = function() {
    this.effects = this.entity.findByTag('effect');

    this.app.on('playeffect', function (name, pos) {
        var effect = this.effects.shift();
        effect.setPosition(pos);
        effect.particlesystem.reset();
        effect.particlesystem.play();
        effect.children[0].particlesystem.reset();
        effect.children[0].particlesystem.play();
        this.effects.push(effect);
    }, this);
};
