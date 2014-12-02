game.TitleScreen = me.ScreenObject.extend({
	/**	
	 *  action to perform on state change
	 */
	onResetEvent: function(titleImage) {	
		var titleImage = new me.sprite(0, 0, me.loader.getImage("title-screen"));
                me.game.world.addChild(titleImage, 1);
	},
	
	
	/**	
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		; // TODO
	}
});
