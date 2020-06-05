nfaces = 30;     //number of edges of a circle
arcStep = 2*Math.PI/nfaces;

divisions = 12;  //number of lines of constant value for each hyperspherical param

R = 100

var c = document.getElementById("canvas");
var context = c.getContext("2d");

function hypersphericalToCartesian(psi, theta, phi){
  const r = R;
  const x0 = r*Math.cos(psi);
  const x1 = r*Math.sin(psi)*Math.cos(theta);
  const x2 = r*Math.sin(psi)*Math.sin(theta)*Math.cos(phi);
  const x3 = r*Math.sin(psi)*Math.sin(theta)*Math.sin(phi);
  return math.matrix([x0, x1, x2, x3]);
}

// constant psi, theta. phi sweeps 0 -> 2pi
function generateParallel(psi, theta){
  path = []
  for(var i = 0; i <= nfaces; i++){
    path.push(hypersphericalToCartesian(psi, theta, i*arcStep))
  }
  return path;
}

// constant psi, phi. theta sweeps 0 -> pi
function generateMeridian(psi, phi){
  path = []
  for(var i = 0; i <= nfaces/2; i++){
    path.push(hypersphericalToCartesian(psi, i*arcStep, phi))
  }
  return path;
}

// constant theta, phi. psi sweeps 0 -> pi
function generateHypermeridian(theta, phi){
  path = []
  for(var i = 0; i <= nfaces/2; i++){
    path.push(hypersphericalToCartesian(i*arcStep, theta, phi))
  }
  return path;
}

function generate2sphere(){
  paths = []
  var i = 0;
  for(i=0; i<divisions; i++){
    paths.push(generateParallel(Math.PI/2, i*Math.PI/divisions));
  }
  for(i=0; i<2*divisions; i++){
    paths.push(generateMeridian(Math.PI/2, i*Math.PI/divisions));
  }
  return paths;
}

function draw4Dpaths(paths, ctx){
  const proj4to3 = math.matrix([[0,1,0,0],[0,0,1,0],[0,0,0,1]]);

  const paths3d = paths.map(path => path.map(point4d => math.multiply(proj4to3, point4d)))

  const rotate3d = math.matrix([[1,0,0],[0,1,0],[0,0,1]])
  const proj3to2 = math.matrix([[0,1,0],[0,0,1]])
  const mat3to2 = math.multiply(proj3to2, rotate3d);

  const paths2d = paths3d.map(path => path.map(point3d => math.multiply(mat3to2, point3d)))

  for(i in paths2d){
    const points = paths2d[i].map(point2d => point2d.valueOf())
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for(n in points){           // kind of redundant that the first line as zero length, but ok
      ctx.lineTo(points[n][0], points[n][1]);
    }
    ctx.stroke();
  }
}

/*
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(300, 150);
  ctx.stroke();

*/
