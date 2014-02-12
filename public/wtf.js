var createEngine = require('voxel-engine');
var game = createEngine({
  chunkDistance: 2,
  materials: [ 'grass_top', 'tree_side', 'leaves_opaque' ],
  texturePath: './textures/'
});
game.controls.pitchObject.rotation.x = -1.5;
game.appendTo('#container');
window.game = game;

var createTree = require('voxel-forest');
for (var i = 0; i < 250; i++) {
      createTree(game, { bark: 2, leaves: 3 });
}

window.addEventListener('keydown', ctrlToggle);
window.addEventListener('keyup', ctrlToggle);

var erase = true
function ctrlToggle (ev) { erase = !ev.ctrlKey }
game.requestPointerLock('canvas');
