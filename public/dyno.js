var createTree = require('voxel-forest');

// Based on the Voxel "Tower" example.

// a convenience function, usage:
// var dyno = require('voxel-dyno')(game)
module.exports = function(game, opts) {
  return new Dyno(game, opts)
}

// expose the Dyno constructor so that it is available
// in case someone wants to access the .prototype methods, etc
module.exports.Dyno = Dyno

function Dyno(game, opts) {
  // protect against people who forget 'new'
  if (!(this instanceof Dyno)) return new Dyno(game, opts)

  // we need to store the passed in variables on 'this'
  // so that they are available to the .prototype methods
  this.game = game
  this.opts = opts || {}
  this.material = this.opts.material || 'brick'
}

// creates a new stack of voxels
// usage:
// var dyno = require('voxel-dyno')(game, opts)
// dyno.place("browsing-quietly-16")
Dyno.prototype.place = function(name) {
  var tree = createTree(game, { bark: 2, leaves: 3 });
//  LabelPlugin(game);
//  var label = LabelPlugin.label(name, null, game, 1);
}
