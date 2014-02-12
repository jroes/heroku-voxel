var createTerrain = require('voxel-perlin-terrain');
var game = require('voxel-engine')({
  generateVoxelChunk: createTerrain(2, 32),
  chunkDistance: 2,
  //materials: [ 'grass_top', 'tree_side', 'leaves_opaque' ],
  texturePath: './textures/'
  //texturePath: '/textures/',
  //chunkDistance: 2,
  //materials: [
//    ['grass', 'dirt', 'grass_dirt'],
 //     'obsidian',
  //    'brick',
   //   'grass',
//      'plank'
//  ],
//  materialFlatColor: false,
  //generate: function(x, y, z) {
//    return (x*x+y*y+z*z <= 15*15 && y === 1) ? 1 : 0
 // }
})
//var dyno = require('./dyno')(game);

game.controls.pitchObject.rotation.x = -1.5;
game.appendTo('#container');
window.game = game;

var createTree = require('voxel-forest');
for (var i = 0; i < 250; i++)
  createTree(game, { bark: 2, leaves: 3 });

request = new XMLHttpRequest;
request.open('GET', '/apps', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400){
    var data = JSON.parse(request.responseText);
    console.log("Retrieved data for", data.length, "apps.");
    data.forEach(function (app) {
      console.log("Placing tree for app", app.name);
      //dyno.place(app.name);
    });
  }
};

request.send();
