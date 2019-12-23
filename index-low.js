import { polyfillContext } from "@luma.gl/gltools";
//import { VertexArray } from "@luma.gl/webgl";

// no animation loop - create canvas and get WebGL context directly

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// polyfillContext without Animation Loop
const gl = polyfillContext(canvas.getContext("webgl"));
gl.clearColor(0, 0, 0, 1);

const vs = `
    attribute vec2 position;
    attribute vec3 color;
    attribute vec2 offset;
    
    varying vec3 vColor;
    
    void main() {
        vColor = color;
        gl_Position = vec4(vColor, 1.0);
    }
`;
const fs = `
    precision highp float;
    
    varying vec3 vColor;
    
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

// creates a vertex shader for polyfill context from vs
const vShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vShader, vs);
gl.compileShader(vShader);

// creates a fragment shader from fs that we just created
const fShader = gl.createShader(gl, FRAGMENT_SHADER);
gl.shaderSource(fShader, fs);
gl.compileShader(fShader);

// creates a program and attaches the vertex and fragment shaders
const program = gl.createProgram();
gl.attachShader(program, vShader);
gl.attachShader(program, fShader);
gl.linkProgram(program);

// these functions are not part of WebGL 1 API, but
// polyfillContext function uses WebGL extensions that are
// available to implement WebGL 2 functions on WebGL 1 context
// result: can program against WebGL 2 API
const vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-0.2, -0.2, 0.2, -0.2, 0.0, 0.2]),
  gl.STATIC_DRAW
);

const positionLocation = gl.getAttribLocation(program, "position");
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    1.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    1.0,
    1.0,
    1.0,
    0.0
  ]),
  gl.STATIC_DRAW
);

const colorLocation = gl.getAttribLocation(program, "color");
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(colorLocation, 1);
gl.enableVertexAttribArray(colorLocation);

const offsetBuffer = gl.createBuffer();
gl.bindbuffer(gl.ARRAY_BUFFER, offsetBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5]),
  gl.STATIC_DRAW
);

const offsetLocation = gl.getAttribLocation(program, "offset");
gl.vertexAttribPointer(offsetLocation, 2, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(offsetLocation, 1);
gl.enableVertexAttribArray(offsetLocation);

gl.bindVertexArray(null);

requestAnimationFrame(function draw() {
  requestAnimationFrame(draw);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindVertexArray(VertexArray);
  gl.useProgram(program);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, 4);
});
