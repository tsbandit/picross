// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var param = function(name) {
  var url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

var WIDTH = 800;
var HEIGHT = 600;
var S = 24;

var grid = null;
var ctx = null;
var canvas_rect = null;
var inputs = null;
var textarea = null;

var next = function(curr) {
  if(curr === 'unknown')
    return 'dark';
  if(curr === 'dark')
    return 'cross';
  if(curr === 'cross')
    return 'unknown';
};

var set_size = function(elem, w, h) {
  elem.style.width = w+'px';
  elem.style.height = h + 'px';
};
var set_pos = function(elem, x, y) {
  elem.style.position = 'absolute';
  elem.style.left = x+'px';
  elem.style.top = y+'px';
};

var default_state = (function() {
  var a = [];
  for(var i=0; i<40; ++i)
    a.push('');

  var grid = [];
  for(var i=0; i<20; ++i) {
    grid.push([]);
    for(var j=0; j<20; ++j)
      grid[i].push('unknown');
  }

  return {
    a: a,
    grid: grid,
  };
}());

window.onload = function() {
  // Initialize state
  var param_state = param('state');
  var state;
  if(param_state === null)
    state = default_state;
  else
    state = JSON.parse(atob(param_state));
  var a = state.a;
  grid = state.grid;

  // Create input elements
  inputs = [];
  for(var i=0; i<20; ++i) {
    var input = document.createElement('input');
    input.style['text-align'] = 'right';
    set_pos(input, 0, 100+i*S);
    set_size(input, 100, S);
    document.body.appendChild(input);
    input.value = a.shift();
    inputs.push(input);
  }
  for(var i=0; i<20; ++i) {
    var input = document.createElement('textarea');
    set_pos(input, 100+i*S, 0);
    set_size(input, S, 100);
    document.body.appendChild(input);
    input.value = a.shift();
    inputs.push(input);
  }

  var canvas = document.createElement('canvas');
  canvas.setAttribute('width', WIDTH + '');
  canvas.setAttribute('height', HEIGHT + '');
  set_pos(canvas, 100, 100);
  document.body.style.margin = '0';
  document.body.appendChild(canvas);

  canvas.addEventListener('click', onclick, false);
  canvas_rect = canvas.getBoundingClientRect();

  ctx = canvas.getContext('2d');
  ctx.moveTo(40,40);
  ctx.lineTo(30,30);
  ctx.stroke();

  var button = document.createElement('button');
  button.innerHTML = 'Create a link to this board';
  set_pos(button, 0, S*20 + 100 + 25);
  button.addEventListener('click', generate, false);
  document.body.appendChild(button);

  textarea = document.createElement('textarea');
  set_size(textarea, 500, 100);
  set_pos(textarea, 0, S*20 + 100 + 50);
  document.body.appendChild(textarea);

  draw();
};

var onclick = function(me) {
  var x = me.clientX - canvas_rect.left;
  var y = me.clientY - canvas_rect.top;

  var j = Math.floor(x / S);
  var i = Math.floor(y / S);

  if(i < 0 || i >= 20 || j < 0 || j >= 20)
    return;

  grid[i][j] = next(grid[i][j]);

  draw();
};

var draw = function() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for(var i=0; i<grid.length; ++i) {
    for(var j=0; j<grid[i].length; ++j) {
      var x0 = j*S;
      var x1 = x0 + S;
      var y0 = i*S;
      var y1 = y0 + S;

      if(grid[i][j] === 'dark') {
        ctx.fillRect(x0, y0, S-1, S-1);
      } else if(grid[i][j] === 'cross') {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, y0);
        ctx.lineTo(x0, y1);
        ctx.stroke();
      } else if(grid[i][j] === 'unknown') {
        ctx.beginPath();
        ctx.rect(x0,y0,S,S);
        ctx.stroke();
      }
    }
  }
};

var generate = function() {
  var a = [];
  for(var i=0; i<inputs.length; ++i)
    a.push(inputs[i].value + '');

  var state = {
    a: a,
    grid: grid,
  };

  var str = JSON.stringify(state);
  str = btoa(str);
  str = encodeURIComponent(str);
  textarea.value = window.location.href.split('?')[0] + '?state=' + str;
};
