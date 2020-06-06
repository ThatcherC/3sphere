nfaces = 60;     //number of edges of a circle
arcStep = 2*Math.PI/nfaces;

divisions = 12;  //number of lines of constant value for each hyperspherical param

R = 280

var c = document.getElementById("canvas");
var context = c.getContext("2d");
context.translate(300,300);

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

function generate3sphere(){
  paths = []
  var i =0;

  var psis = [] //values of constant psi
  var thetas = []  //values of constant theta
  var phis = []  //values of constant phi

  for(i = 1; i < divisions; i++) psis.push(i*Math.PI/divisions);
  for(i = 1; i < divisions; i++) thetas.push(i*Math.PI/divisions);
  for(i = 0; i < 2*divisions; i++) phis.push(i*Math.PI/divisions);

  for(n in psis){
    for(m in thetas){
      paths.push(generateParallel(psis[n], thetas[m]));
    }
    for(m in phis){
      paths.push(generateMeridian(psis[n], phis[m]));
    }
  }

  for(n in thetas){
    for(m in phis){
      //paths.push(generateHypermeridian(thetas[n], phis[m]));
    }
  }

  return paths;
}

function project4to3to2(paths4d){
  const proj4to3 = math.matrix([[1,0,0,0],[0,0,1,0],[0,0,0,1]]);

  const paths3d = paths.map(path => path.map(point4d => math.multiply(proj4to3, point4d)))

  const rotate3d = math.matrix([[0,1,0],[1,0,0],[0,0,1]])
  const proj3to2 = math.matrix([[0,1,0],[0,0,1]])
  const mat3to2 = math.multiply(proj3to2, rotate3d);

  const paths2d = paths3d.map(path => path.map(point3d => math.multiply(mat3to2, point3d)))

  return paths2d;
}

function project4to2direct(paths4d){
  const rotate4d = math.matrix([[ 1.0, 0.3,  0.0, 0.1],
                                [ 0.3, 1.0,  0.3, -0.8],
                                [ 0.0,-0.3,  0.2, 0.9],
                                [-0.1, 0.8, -0.9, 0.2]]);
  const proj4to2 = math.matrix([[1,0,0,0],[0,0,0,1]]);  //arbitrary 4->2 projection
  const mat4to2 = math.multiply(proj4to2, rotate4d);

  const paths2d = paths4d.map(path => path.map(point3d => math.multiply(mat4to2, point3d)))

  return paths2d;
}


// x and y are 4d math.js vectors like x = math.matrix([1,2,3,4])
function project4to2directMoreDirect(paths4d, x, y){
  const mat4to2 = math.matrix([x,y]);

  const paths2d = paths4d.map(path => path.map(point3d => math.multiply(mat4to2, point3d)))

  return paths2d;
}

p = math.matrix([1,0,0,0])
q = math.matrix([0,1,0,0])
inc = 0.1

function addp(n, step){
  p._data[n] += step;

  p = math.divide(p, math.norm(p)) //normalize p
  q = math.subtract(q, math.multiply(p, math.dot(p,q)))  //make q orthogonal to p
  q = math.divide(q, math.norm(q)) //normalize q

  clearCanvas()
  draw4Dpaths(threeSphere, context)
}

function addq(n, step){
  q._data[n] += step;

  q = math.divide(q, math.norm(q)) //normalize q
  p = math.subtract(p, math.multiply(q, math.dot(q,p)))  //make p orthogonal to q
  p = math.divide(p, math.norm(p)) //normalize p

  clearCanvas()
  draw4Dpaths(threeSphere, context)
}

function draw4Dpaths(paths, ctx){
  //const paths2d = project4to3to2(paths);
  //const paths2d = project4to2direct(paths);

  const paths2d = project4to2directMoreDirect(paths, p, q);

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

function clearCanvas(){
    // Store the current transformation matrix
  context.save();

  // Use the identity matrix while clearing the canvas
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, c.width, c.height);

  // Restore the transform
  context.restore();
}

threeSphere = generate3sphere();

draw4Dpaths(threeSphere, context)
