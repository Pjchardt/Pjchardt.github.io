"use strict";

const NUM = 15;
let balls = Array(NUM).fill();
let capture = false;
const FPS = 30;
var useFill = true;

let bg;
let button;
let flock;

var data = [];

let font_location_x = 20;
let font_location_y = 400-32;
let instructions_text = "";

function setup() {
  let canvas = createCanvas(windowWidth, 400);
  canvas.parent('sketch-holder');
  frameRate(FPS).noStroke();

  bg = color(Array.from({ length: 3 }, () => ~~random(0xd0, 0x100)));

  for (let i = 0; i < 10; i++) {
    instructions_text += "Click and drag to interact. ";
  }

  textFont('Roboto');

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
}

function draw() {
  //background(bg);
  // Create fade effect.
  noStroke();
  fill(0, 8);
  rect(0, 0, width, height);

  textSize(23);  
  noStroke();
  fill(150, 30, 30); 
  text(instructions_text, 0, height-24, width, height);

  flock.run();
  flock.draw();

  textSize(30);  
  noStroke();
  fill(50+random(100)); 
  text("'Plate tectonics on view from a telescope on Neptune.'", font_location_x, font_location_y);

  if (frameCount %30 == 0) {
    font_location_x = random(400);
    font_location_y = random(height-16);
  }

  
}


// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
  if (flock.boids.length > 50)
  {
      flock.boids.shift();
  }
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.draw = function() {
    for (let i = 0; i < this.boids.length; i++) {
        data = Delaunay.triangulate(this.boids.map(function(pt) {
            return [pt.position.x, pt.position.y];
          }));
      }

      // Display triangles individually.
      for (var i = 0; i < data.length; i += 3) {
        // Collect particles that make this triangle.
        var p1 = this.boids[data[i]];
        var p2 = this.boids[data[i+1]];
        var p3 = this.boids[data[i+2]];
        
        // Don't draw triangle if its area is too big.
        var distThresh = 7500;
        
        if (dist(p1.position.x, p1.position.y, p2.position.x, p2.position.y) > distThresh) {
          continue;
        }
        
        if (dist(p2.position.x, p2.position.y, p3.position.x, p3.position.y) > distThresh) {
          continue;
        }
        
        if (dist(p1.position.x, p1.position.y, p3.position.x, p3.position.y) > distThresh) {
          continue;
        }
        
        // Base its hue by the particle's life.
        if (useFill && random(255) > 250) {

          fill(random(255), random(255), random(255), 240);

          stroke(random(255), random(255), random(255), 200);
        } else {
          noFill();
          stroke(165*p5.Vector.dist(p1.position,p2.position)*.1, 360, 360);
        }
        
        triangle(p1.position.x, p1.position.y, 
                 p2.position.x, p2.position.y, 
                 p3.position.x, p3.position.y);
      }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

Flock.prototype.removeBoid = function() {
    this.boids.pop();
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-.5, .5), random(-.1, .1));
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.5; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  //this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  let theta = this.velocity.heading() + radians(90);
  fill(127);
  stroke(200);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.velocity.x *= -1;
  if (this.position.y < -this.r)  this.velocity.y *= -1;
  if (this.position.x > width + this.r) this.velocity.x *= -1;
  if (this.position.y > height + this.r) this.velocity.y *= -1;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}
