var canvas;
var gl;

function InitializeWebGL() {
  /*=================Creating a canvas=========================*/
         canvas = document.getElementById('shader_1');
         gl = canvas.getContext('webgl');
         window.addEventListener('resize', resizeCanvas, false);
         resizeCanvas();

         /*===========Defining and storing the geometry==============*/

         var vertices = [
            -5.0,3.5,0.0,
            -5.0,-3.5,0.0,
            5.0,-3.5,0.0,
            5.0,3.5,0.0
         ];

         var colors = [0,0,1, 1,0,0, 0,1,0, 1,0,1,];

         indices = [3,2,1,3,1,0];

         //Create and store data into vertex buffer
         var vertex_buffer = gl.createBuffer ();
         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

         //Create and store data into color buffer
         var color_buffer = gl.createBuffer ();
         gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

         //Create and store data into index buffer
         var index_buffer = gl.createBuffer ();
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

         /*==========================Shaders=========================*/

         var vertCode = 'attribute vec3 position;'+
            'uniform mat4 Pmatrix;'+
            'uniform mat4 Vmatrix;'+
            'uniform mat4 Mmatrix;'+
            'attribute vec3 color;'+//the color of the point
            'varying vec3 vColor;'+

            'void main(void) { '+//pre-built function
               'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);'+
               'vColor = color;'+
            '}';

         var fragCode = 'precision mediump float;'+
            'varying vec3 vColor;'+
            'uniform float time;'+
            'uniform vec2 resolution;'+
            'void main(void) {'+
               'vec2 st = gl_FragCoord.xy/resolution;'+
               'vec3 color = vec3(0.0);'+
               //'st.x += sin(time + sin(st.y)* (sin(time*.25) * 1000.)) * .05;'+
               'st.x += sin(time*.0001 + sin(st.y)* (sin(time*.00025) * 1000.)) * .05;'+
               'st.y += cos(time*.01 + sin(st.x)* (cos(time*.01) * 1000.)) * .1;'+
               'vec2 pos = vec2(0.5)-st;'+
               'float r = length(pos)*1.0*sin(time*.001)+.5;'+
               'float a = atan(pos.y,pos.x);'+
               'a = time*.001+sin(a);'+

               'float aAnim = (time*.001+a);'+
               'float f = abs(cos(aAnim*12.)*sin(a*3.))*.8+.1;'+

               'color = vec3( 1.-smoothstep(f,f-0.05,r)-(smoothstep(f, f+.05,r)) );'+
               'color += vec3( 1.-smoothstep(f,f-0.2,r)-(smoothstep(f, f+.2,r)), .0, .0 );'+
               'color += vec3( 0.0, 0.0, (1.-smoothstep(f,f-0.5,r)-(smoothstep(f, f+.4,r))*2.));'+

               'float gray = dot(color, vec3(0.299, 0.587, 0.114));'+
               'gl_FragColor = vec4(vec3(1.0-gray), step(.9, 1.0-color));'+
               //'gl_FragColor = vec4(color, step(.1, color));'+

               //'gl_FragColor = vec4(vColor * gl_FragCoord.xyz, abs(sin(time)));'+
            '}';


         var vertShader = gl.createShader(gl.VERTEX_SHADER);
         gl.shaderSource(vertShader, vertCode);
         gl.compileShader(vertShader);

         var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
         gl.shaderSource(fragShader, fragCode);
         gl.compileShader(fragShader);

         var shaderProgram = gl.createProgram();
         gl.attachShader(shaderProgram, vertShader);
         gl.attachShader(shaderProgram, fragShader);
         gl.linkProgram(shaderProgram);

         /*===========associating attributes to vertex shader ============*/

         var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
         var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
         var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");
         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

         var position = gl.getAttribLocation(shaderProgram, "position");
         gl.vertexAttribPointer(position, 3, gl.FLOAT, false,0,0) ; //position
         gl.enableVertexAttribArray(position);
         gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

         var color = gl.getAttribLocation(shaderProgram, "color");
         gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ; //color
         gl.enableVertexAttribArray(color);
         gl.useProgram(shaderProgram);

         const timeLocation = gl.getUniformLocation(shaderProgram, "time");
         const resolutionLocation = gl.getUniformLocation(shaderProgram, "resolution");

         /*========================= MATRIX ========================= */

         function get_projection(angle, a, zMin, zMax) {
            var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
            return [
               0.5/ang, 0 , 0, 0,
               0, 0.5*a/ang, 0, 0,
               0, 0, -(zMax+zMin)/(zMax-zMin), -1,
               0, 0, (-2*zMax*zMin)/(zMax-zMin), 0
            ];
         }

         var proj_matrix = get_projection(40, gl.canvas.width/gl.canvas.height, 1, 100);
         var mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
         var view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

         //translating z
         view_matrix[14] = view_matrix[14]-6; //zoom

         /*=======================rotation========================*/
         function rotateZ(m, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var mv0 = m[0], mv4 = m[4], mv8 = m[8];

            m[0] = c*m[0]-s*m[1];
            m[4] = c*m[4]-s*m[5];
            m[8] = c*m[8]-s*m[9];
            m[1] = c*m[1]+s*mv0;
            m[5] = c*m[5]+s*mv4;
            m[9] = c*m[9]+s*mv8;
         }

         /*=================Drawing===========================*/

         var time_old = 0;
         var animate = function(time) {
            var dt = time-time_old;
            //rotateZ(mov_matrix, dt*0.002);
            time_old = time;

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clearDepth(1.0);
            gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
            gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
            gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);

            gl.uniform1f(timeLocation, time/1000);
            gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            window.requestAnimationFrame(animate);
         }
         animate(0);

}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
