require('voxel-registry');
require('voxel-player');
require('voxel-blockdata');
require('voxel-highlight');
require('voxel-display-blockdata');

var createEngine = require('voxel-engine');
var game = createEngine({
  texturePath: './textures/',
  generate: function(x, y, z) {
    return y === 1 ? 1 : 0
  },
  useAtlas: true,
  materials: ['dirt', 'grass', 'grass_dirt']
});
game.appendTo(document.body);
window.game = game;

var createPlugins = require('voxel-plugins');
var plugins = createPlugins(game, {require:require});
plugins.add('voxel-registry', {});
plugins.add('voxel-player', {image: 'player.png', homePosition: [0,2,0], homeRotation: [0,0,0]})
plugins.add('voxel-highlight', {});
plugins.add('voxel-blockdata', {});
plugins.add('voxel-display-blockdata', {});
plugins.enable('voxel-player');
plugins.enable('voxel-registry');
plugins.enable('voxel-highlight');
plugins.enable('voxel-blockdata');
plugins.enable('voxel-display-blockdata');

var createTree = require('voxel-trees');

request = new XMLHttpRequest;
request.open('GET', '/apps', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400){
    var blockdata = game.plugins.get('voxel-blockdata');
    var data = JSON.parse(request.responseText);
    console.log("Retrieved data for", data.length, "apps.");
    for (var i = 0; i < data.length; i++) {
      var app = data[i];
      console.log("Placing tree for app", app.name);
      createTree({ 
        position: { z: 2, y: 2, x: i*4 },
        height: app.collaborators.length, radius: app.dynos.length/8.0,
        treeType: 'guybrush',
        setBlock: function (pos, value) {
          blockdata.set(pos.x, pos.y, pos.z, { info: [app.name, "-", app.dynos.length, "dynos", app.collaborators.length, "collaborators."].join(" ") });
          game.createBlock([pos.x, pos.y, pos.z], value);
          return false;
        }});
    }
  }
};

request.send();
