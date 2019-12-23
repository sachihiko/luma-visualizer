import { AnimationLoop, Model } from "@luma.gl/engine";
import { Buffer, clear } from "@luma.gl/webgl";

// GLSL code that will be inserted into vertex and fragment shaders
// used to define functions that implement generic functionality to be
// reused in different prog
const colorShaderModule = {
  name: "color",
  vs: `
        varying vec3 color_vColor;

        void color_setColor(vec3 color) {
            color_vColor = color;
        }
    `,
  fs: `
        varying vec3 color_vColor;
        
        vec3 color_getColor() {
            return color_vColor;
        }
    `
};
const loop = new AnimationLoop({
  onInitialize({ gl }) {
    // Setup logic goes here
    //buffers
    const positionBuffer = new Buffer(
      gl,
      // every pair of values are coordinates on 2d plane
      new Float32Array([-0.2, -0.2, 0.2, -0.2, 0.0, 0.2])
    );
    const colorBuffer = new Buffer(
      gl,
      // every three values represent rgb values
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
      ])
    );
    const offsetBuffer = new Buffer(
      gl,
      new Float32Array([0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5])
    );
    // attribute: are global variables that may chagne per vertex
    // passed from OpenGL application to vertex shaders
    // this qualifier can only be used in vertex shaders

    // varying: used for interpolated data between a vertex shader and
    // a fragment shader
    // available for writing in vertex shader, read-only in fragment
    // shader

    // Shaders
    const vs = `
        attribute vec2 position;
        attribute vec3 color;
        attribute vec2 offset;

        varying vec3 vColor;

        void main() {
            color_setColor(color);
            gl_Position = vec4(position + offset, 0.0, 1.0);
        }
    `;
    const fs = `
        void main() {
            gl_FragColor = vec4(color_getColor(), 1.0);
        }
    `;

    // gathering all WebGL pieces for single draw call:
    // programs, attributes, uniforms
    const model = new Model(gl, {
      vs,
      fs,
      modules: [colorShaderModule],
      attributes: {
        position: positionBuffer,
        // second elems are accessors that describe how buffer should be
        // traversed during a draw
        color: [colorBuffer, { divisor: 1 }],
        offset: [offsetBuffer, { divisor: 1 }]
      },
      // 3 vertices for a triangle
      vertexCount: 3,
      instanceCount: 4
    });

    return { model };
  },

  onRender({ gl, model }) {
    // Drawing logic goes here
    clear(gl, { color: [0, 0, 0, 1] });
    model.draw();
  }
});

loop.start();
