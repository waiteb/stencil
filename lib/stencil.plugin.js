
/* jshint node: true, esversion: 6, undef: true, unused: true */

/**
 * A plugin allows you to customize the behavior of stencil compilation and rendering.
 * 
 * @param  {string} name The name of the plugin
 * @param  {object} settings Any additional settings that should be copied onto the instance
 */
function Plugin(name, settings) {
    this.name = name;
    Object.assign(this, settings);
}

// Default properties:
Plugin.prototype.priority = 10;
Plugin.prototype.onRenderAttribute = function() {};
Plugin.prototype.onRenderElement = function() {};

module.exports = Plugin;