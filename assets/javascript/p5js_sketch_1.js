/*
Just started using openprocessing today. Don't know how it works. Anyway, I forked this sketch and messed with it. Original comment below:

Frozen brush

Makes use of a delaunay algorithm to create crystal-like shapes.
The delaunay library was developed by Jay LaPorte at https://github.com/ironwallaby/delaunay/blob/master/delaunay.js

Controls:
	- Drag the mouse.
    - Press any key to toggle between fill and stroke.

Inspired by:
	Makio135's sketch www.openprocessing.org/sketch/385808

Author:
  Jason Labbe

Site:
  jasonlabbe3d.com
*/

var allParticles = [];
var maxLevel = 5;
var useFill = false;
var agentX, agentY;
var velX, velY;

var data = [];
var cells = [];

// Moves to a random direction and comes to a stop.
// Spawns other particles within its lifetime.
function Particle(x, y, level) {
  this.level = level;
  this.life = 0;
  
  this.pos = new p5.Vector(x, y);
  this.vel = p5.Vector.random2D();
  this.vel.mult(map(this.level, 0, maxLevel, 1, 1.5));
  
  this.move = function() {
    this.life++;
    
    // Add friction.
    this.vel.mult(1.01);
    
    this.pos.add(this.vel);
    
    // Spawn a new particle if conditions are met.
    if (this.life % 10 == 0) {
      if (this.level > 0) {
        this.level -= 1;
				for (let i = 0; i < 1; i++) {
					var newParticle = new Particle(this.pos.x+random(-1,1), this.pos.y+random(-1,1), this.level-1);
					allParticles.push(newParticle);
				}
      }
    }
  }
}


function setup() {
    var canvas = createCanvas(windowWidth, windowHeight); 
    canvas.parent('sketch-holder');
    colorMode(HSB, 360);
  
    textAlign(CENTER);
  
    background(0);
	
    agentX = windowWidth/2;
	agentY = windowHeight/2;
	velX = velY = 0;
} 


function draw() {
	if (frameCount % 2 == 0) {
		update_touches_sim();
	}
	
  // Create fade effect.
  noStroke();
  fill(0, 30);
  rect(0, 0, width, height);
  
  // Move and spawn particles.
  // Remove any that is below the velocity threshold.
  for (var i = allParticles.length-1; i > -1; i--) {
    allParticles[i].move();
    
    if (allParticles[i].vel.mag() > 5) {
      allParticles.splice(i, 1);
    }
  }
  
  if (allParticles.length > 0) {
    // Run script to get points to create triangles with.
    data = Delaunay.triangulate(allParticles.map(function(pt) {
      return [pt.pos.x, pt.pos.y];
    }));
  	
    strokeWeight(0.1);
    
    // Display triangles individually.
    for (var i = 0; i < data.length; i += 3) {
      // Collect particles that make this triangle.
      var p1 = allParticles[data[i]];
      var p2 = allParticles[data[i+1]];
      var p3 = allParticles[data[i+2]];
      
      // Don't draw triangle if its area is too big.
      var distThresh = 2500;
      
      if (dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) > distThresh) {
        continue;
      }
      
      if (dist(p2.pos.x, p2.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }
      
      if (dist(p1.pos.x, p1.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }
      
      // Base its hue by the particle's life.
      if (useFill) {
        noStroke();
        fill(165+p1.life*1.5, 360, 360);
      } else {
        noFill();
        stroke(165+p1.life*1.5, 360, 360);
      }
      
      triangle(p1.pos.x, p1.pos.y, 
               p2.pos.x, p2.pos.y, 
               p3.pos.x, p3.pos.y);
    }
  }
  
  noStroke();
  fill(255);
}

function update_touches_sim() {
	velX = constrain(velX + random(-1, 1), -3, 3);
	velY = constrain(velY + random(-1, 1), -3, 3);
	agentX = constrain(agentX + velX, 0, windowWidth);
	agentY = constrain(agentY + velY, 0, windowHeight);
    allParticles.push(new Particle(agentX, agentY, maxLevel));
    
    if (random(100) < 3) {
        useFill = ! useFill;
    }
}

function mouseDragged() {
  allParticles.push(new Particle(mouseX, mouseY, maxLevel));
}


function keyPressed() {
  useFill = ! useFill;
}