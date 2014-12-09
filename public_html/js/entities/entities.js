
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                width: 128,
                height: 128,
                getShape: function() {
                    return (new me.Rect(0, 0, 30, 128)).toPolygon();
                }

            }]);

        this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("bigIdle", [19]);
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("shrink", [0, 1, 2, 3], 80);
        this.renderable.addAnimation("grow", [4, 5, 6, 7], 80);
       
       
        this.renderable.setCurrentAnimation("idle");

        this.big = false;
        //this is the set character speed for x and y axis//
        this.body.setVelocity(5, 20);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

    },
    update: function(delta) {

        //this says if right arrow key is pressed the charater will move right//
        if (me.input.isKeyPressed("right")) {
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            //If the left arrow key is pressed the character will move left//
        } else if (me.input.isKeyPressed("left")) {
            this.body.vel.x -= this.body.accel.x / me.timer.tick;

        } else {
            this.body.vel.x = 0;
        }
        //this says if the "up" arrow key is pressed the charater will jump up//
        if (me.input.isKeyPressed("up")) {
            this.body.vel.y -= this.body.accel.y * me.timer.tick;

        }
       
        this.body.update(delta);
        //this line of code will collide with anything that has a solid brick inside of tile// 
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (!this.big) {
            if (this.body.vel.x !== 0) {                             //this says if the character is in the middle of shrinking or growning he is not going back to walking//
                if (!this.renderable.isCurrentAnimation("smallWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
                this.renderable.setCurrentAnimation("idle");
            }
        } else {

            if (this.body.vel.x !== 0) {                      //this says if the character is in the middle of shrinking or growning he is not going back to walking//
                if (!this.renderable.isCurrentAnimation("bigWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
                this.renderable.setCurrentAnimation("bigIdle");
            }
        
       
       
       
       this._super(me.Entity, "update", [delta]);
       return true;
   }
   },
   
   
    collideHandler: function(response) {
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);

        //response.b represents what mario is running into in this case it is badguy//
        if (response.b.type === 'badguy') {
            if (ydif <= -115) {
                response.b.alive = false;
            } else {
                if (this.big) {
                    this.big = false;
                    this.body.vel.y -= this.body.accel.y * me.timer.tick;
                    //this line of code says if I touch the badguy when im big i will jump away//
                    this.jumping = true;
                    //this says when i shrink i will run through small idle next//
                    this.renderable.setCurrentAnimation("shrink", "idle");
                    //when it runs through the code the animation will start from the very beginning//
                    this.renderable.setAnimationFrame();
                } else {
                    me.state.change(me.state.MENU);
                }
            }
        } else if (response.b.type === 'mushroom') {
            this.renderable.setCurrentAnimation("grow", "bigIdle");
            this.big = true;
            me.game.world.removeChild(response.b);
        }

    }
   
       

        
});

game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;

    },
    onCollision: function() {
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }
    
});

game.BadGuy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                width: 60,
                height: 28,
                getShape: function() {
                    return (new me.Rect(0, 0, 60, 28)).toPolygon();
                }

            }]);
        
        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        //this is the starting point for the bad guy//
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.x = x + width - this.spritewidth;

        this.updateBounds();
        //this code says that even if we are on the screen the badguy should be updated this also adds performance issues to the game//
        this.alwaysUpdate = true;
        //this tells the game whether our character is walking left or right//
        this.walkLeft = false;
        //this tells the game if our badguy is alive//
        this.alive = true;
        //this will determine whether what mario walks into different things will happen than walking into something like a mushroom//
        this.type = "badguy";

        this.renderable.addAnimation("run", [0, 1, 2], 80);
        this.renderable.setCurrentAnimation("run");
        //this tells how fast our badguy will be going//
        this.body.setVelocity(4, 6);
    },
    update: function(delta) {
        this.body.update(delta);
        //we are checking if we are colliding with the slime it would go to the collideHandler to see if we have collided with the slime//
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }//this tells the animation/badguy which direction he is facing//
            this.flipX(!this.walkLeft);
            //this line of code tells if the statement is true, do whatever is on the left side of the colon, and if this statement is false do whatever is on the right side of the colon.
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

        } else {
            me.game.world.removeChild(this);
        }


        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function(){
        
    }


});

game.Mushroom = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mushroom",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                    return (new me.Rect(0, 0, 64, 64)).toPolygon();
                }

            }]);

        me.collision.check(this);
        this.type = "mushroom";
    }

});
    
    





    