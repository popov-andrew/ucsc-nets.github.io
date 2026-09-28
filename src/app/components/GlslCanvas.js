"use client";

function isCanvasVisible(canvas) {
    const bound = canvas.getBoundingClientRect();
    return bound.top + bound.height > 0 && bound.top < (window.innerHeight || document.documentElement.clientHeight);
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function isDiff(a, b) {
    if (a && b) return a.toString() !== b.toString();
    return false;
}

function getFile(url) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url, false);
    httpRequest.send();
    if (httpRequest.status === 200) return httpRequest.responseText;
    return "";
}

function subscribeMixin(target) {
    const listeners = new Set();
    return Object.assign(target, {
        on(type, f) {
            listeners.add({ [type]: f });
        },
        off(type, f) {
            if (f) {
                for (let item of listeners) {
                    if (item[type] === f) listeners.delete(item);
                }
            } else {
                for (let item of listeners) {
                    if (Object.keys(item)[0] === type) listeners.delete(item);
                }
            }
        },
        trigger(event, ...data) {
            for (let listener of listeners) {
                if (typeof listener[event] === 'function') {
                    listener[event](...data);
                }
            }
        }
    });
}

function setupWebGL(canvas, optAttribs, onError) {
    function handleError(errorCode, msg) {
        if (typeof onError === 'function') onError(errorCode);
        else console.error(msg);
    }
    if (!window.WebGLRenderingContext) {
        handleError(1, "WebGL not supported");
        return null;
    }
    const context = canvas.getContext('webgl', optAttribs) || canvas.getContext('experimental-webgl', optAttribs);
    if (!context) handleError(2, "WebGL context creation failed");
    else context.getExtension('OES_standard_derivatives');

    return context;
}

function createShader(main, source, type, offset) {
    const gl = main.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const lastError = gl.getShaderInfoLog(shader);
        console.error('*** Error compiling shader:', lastError);
        main.trigger('error', { shader, source, type, error: lastError, offset: offset || 0 });
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(main, shaders, optAttribs, optLocations) {
    const gl = main.gl;
    const program = gl.createProgram();
    for (let i = 0; i < shaders.length; ++i) {
        gl.attachShader(program, shaders[i]);
    }
    if (optAttribs) {
        for (let i = 0; i < optAttribs.length; ++i) {
            gl.bindAttribLocation(program, optLocations ? optLocations[i] : i, optAttribs[i]);
        }
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error in program linking:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function parseUniforms(uniforms, prefix = null) {
    let parsed = [];
    for (let name in uniforms) {
        let uniform = uniforms[name];
        if (prefix) name = prefix + '.' + name;

        if (typeof uniform === 'number') {
            parsed.push({ type: 'float', method: '1f', name, value: uniform });
        } else if (Array.isArray(uniform)) {
            if (typeof uniform[0] === 'number') {
                if (uniform.length === 1) parsed.push({ type: 'float', method: '1f', name, value: uniform });
                else if (uniform.length >= 2 && uniform.length <= 4) parsed.push({ type: 'vec' + uniform.length, method: uniform.length + 'fv', name, value: uniform });
                else if (uniform.length > 4) parsed.push({ type: 'float[]', method: '1fv', name: name + '[0]', value: uniform });
            } else if (typeof uniform[0] === 'string') {
                parsed.push({ type: 'sampler2D', method: '1i', name, value: uniform });
            }
        } else if (typeof uniform === 'boolean') {
            parsed.push({ type: 'bool', method: '1i', name, value: uniform });
        } else if (typeof uniform === 'string') {
            parsed.push({ type: 'sampler2D', method: '1i', name, value: uniform });
        } else if (typeof uniform === 'object') {
            parsed.push(...parseUniforms(uniform, name));
        }
    }
    return parsed;
}

class Texture {
    static activeUnit = -1;
    static activeTexture = null;

    constructor(gl, name, options = {}) {
        subscribeMixin(this);
        this.gl = gl;
        this.texture = gl.createTexture();
        this.valid = !!this.texture;
        this.bind();
        this.name = name;
        this.source = null;
        this.sourceType = null;
        this.loading = null;
        this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), { filtering: 'linear' });
        this.setFiltering(options.filtering);
        this.load(options);
    }

    destroy() {
        if (!this.valid) return;
        this.gl.deleteTexture(this.texture);
        this.texture = null;
        this.data = null;
        this.valid = false;
    }

    bind(unit) {
        if (!this.valid) return;
        if (typeof unit === 'number' && Texture.activeUnit !== unit) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            Texture.activeUnit = unit;
        }
        if (Texture.activeTexture !== this.texture) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            Texture.activeTexture = this.texture;
        }
    }

    load(options = {}) {
        this.loading = null;
        if (typeof options.url === 'string') {
            if (this.url === undefined || options.url !== this.url) this.setUrl(options.url, options);
        } else if (options.element) {
            this.setElement(options.element, options);
        } else if (options.data && options.width && options.height) {
            this.setData(options.width, options.height, options.data, options);
        }
    }

    setUrl(url, options = {}) {
        if (!this.valid) return;
        this.url = url;
        this.source = this.url;
        this.sourceType = 'url';
        this.loading = new Promise((resolve) => {
            const ext = url.split('.').pop().toLowerCase();
            const isVideo = ['ogv', 'webm', 'mp4'].includes(ext);
            let element = isVideo ? document.createElement('video') : new Image();

            if (isVideo) {
                element.autoplay = true;
                element.muted = true;
                setTimeout(() => element.play(), 1);
                options.filtering = 'nearest';
            }

            element.onload = () => {
                try { this.setElement(element, options); }
                catch (e) { console.error(`Failed to load texture ${this.name}`, e); }
                resolve(this);
            };
            element.onerror = (e) => {
                console.error(`Failed to load texture ${this.name}`, e);
                resolve(this);
            };

            if (!(isSafari() && this.source.slice(0, 5) === 'data:')) {
                element.crossOrigin = 'anonymous';
            }

            element.src = this.source;
            if (isVideo) this.setElement(element, options);
        });
        return this.loading;
    }

    setData(width, height, data, options = {}) {
        this.width = width;
        this.height = height;
        this.source = data;
        this.sourceType = 'data';
        this.update(options);
        this.setFiltering(options);
        this.loading = Promise.resolve(this);
        return this.loading;
    }

    setElement(element, options) {
        let el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el instanceof HTMLCanvasElement || el instanceof HTMLImageElement || el instanceof HTMLVideoElement) {
            this.source = el;
            this.sourceType = 'element';
            if (el instanceof HTMLVideoElement) {
                this.width = el.videoWidth;
                this.height = el.videoHeight;
                el.addEventListener('canplaythrough', () => {
                    this.intervalID = setInterval(() => this.update(options), 15);
                }, true);
                el.addEventListener('ended', () => {
                    el.currentTime = 0;
                    el.play();
                }, true);
            } else {
                this.update(options);
            }
            this.setFiltering(options);
        }
        this.loading = Promise.resolve(this);
        return this.loading;
    }

    update(options = {}) {
        if (!this.valid) return;
        this.bind();
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, options.UNPACK_FLIP_Y_WEBGL !== false);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.UNPACK_PREMULTIPLY_ALPHA_WEBGL || false);

        if (this.sourceType === 'element' && (this.source instanceof HTMLCanvasElement || this.source instanceof HTMLVideoElement || (this.source instanceof HTMLImageElement && this.source.complete))) {
            this.width = this.source instanceof HTMLVideoElement ? this.source.videoWidth : this.source.width;
            this.height = this.source instanceof HTMLVideoElement ? this.source.videoHeight : this.source.height;
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.source);
        } else if (this.sourceType === 'data') {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.source);
        }
        this.trigger('loaded', this);
    }

    setFiltering(options = {}) {
        if (!this.valid) return;
        this.powerOf2 = isPowerOf2(this.width) && isPowerOf2(this.height);
        this.filtering = options.filtering || 'linear';
        const gl = this.gl;
        this.bind();

        if (this.powerOf2) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.REPEAT);
            if (this.filtering === 'mipmap') {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
            } else if (this.filtering === 'linear') {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            } else if (this.filtering === 'nearest') {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (this.filtering === 'mipmap') this.filtering = 'linear';
            if (this.filtering === 'nearest') {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        }
    }
}

export default class GlslCanvas {
    constructor(canvas, contextOptions = {}, options = {}) {
        subscribeMixin(this);
        this.canvas = canvas;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        this.gl = setupWebGL(canvas, contextOptions, options.onError);
        if (!this.gl) return;

        this.deps = {};
        this.textures = {};
        this.buffers = {};
        this.uniforms = {};
        this.vbo = {};
        this.isValid = false;
        this.BUFFER_COUNT = 0;
        this.timeLoad = this.timePrev = performance.now();
        this.timeDelta = 0.0;
        this.forceRender = true;
        this.paused = false;
        this.realToCSSPixels = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

        this.vertexString = contextOptions.vertexString || `
            #ifdef GL_ES
            precision mediump float;
            #endif
            attribute vec2 a_position;
            attribute vec2 a_texcoord;
            varying vec2 v_texcoord;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texcoord = a_texcoord;
            }
        `;
        this.fragmentString = contextOptions.fragmentString || `
            #ifdef GL_ES
            precision mediump float;
            #endif
            varying vec2 v_texcoord;
            void main(){
                gl_FragColor = vec4(0.0);
            }
        `;

        if (canvas.hasAttribute('data-fragment-url')) {
            fetch(canvas.getAttribute('data-fragment-url'))
                .then(r => r.text())
                .then(body => this.load(body, this.vertexString));
        } else if (canvas.hasAttribute('data-fragment')) {
            this.fragmentString = canvas.getAttribute('data-fragment');
        }

        this.load();
        if (!this.program) return;

        const gl = this.gl;
        const texCoordsLoc = gl.getAttribLocation(this.program, 'a_texcoord');
        this.vbo.texCoords = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.texCoords);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordsLoc);
        gl.vertexAttribPointer(texCoordsLoc, 2, gl.FLOAT, false, 0, 0);

        const verticesLoc = gl.getAttribLocation(this.program, 'a_position');
        this.vbo.vertices = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(verticesLoc);
        gl.vertexAttribPointer(verticesLoc, 2, gl.FLOAT, false, 0, 0);

        let mouse = { x: 0, y: 0 };
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX || e.pageX;
            mouse.y = e.clientY || e.pageY;
        }, false);

        const RenderLoop = () => {
            if (this.nMouse > 1) this.setMouse(mouse);
            if (this.resize()) this.forceRender = true;
            this.render();
            this.animationFrameRequest = window.requestAnimationFrame(RenderLoop);
        };

        this.setMouse({ x: 0, y: 0 });
        RenderLoop();
    }

    destroy() {
        if (this.animationFrameRequest) cancelAnimationFrame(this.animationFrameRequest);
        this.animated = false;
        this.isValid = false;
        for (let tex in this.textures) {
            if (this.textures[tex].destroy) this.textures[tex].destroy();
        }
        this.textures = {};
        for (let att in this.vbo) {
            this.gl.deleteBuffer(this.vbo[att]);
        }
        this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
        for (let key in this.buffers) {
            this.gl.deleteProgram(this.buffers[key].program);
        }
        this.program = null;
        this.gl = null;
    }

    load(fragString, vertString) {
        if (!this.gl) return;

        if (vertString) this.vertexString = vertString;
        if (fragString) this.fragmentString = fragString;

        const lines = this.fragmentString.split(/\r?\n/);
        this.fragmentString = "#define PLATFORM_WEBGL\n#line 0\n";

        lines.forEach((line, i) => {
            const line_trim = line.trim();
            if (line_trim.startsWith('#include "lygia')) {
                const dep = line_trim.substring(15).replace(/'|"|;|\s/g, '');
                if (dep.endsWith('glsl')) {
                    if (this.deps[dep] === undefined) {
                        this.deps[dep] = getFile(`https://lygia.xyz${dep}`);
                    }
                    this.fragmentString += this.deps[dep] + '\n#line ' + (i + 1) + '\n';
                }
            } else {
                this.fragmentString += line + '\n';
            }
        });

        this.nDelta = (this.fragmentString.match(/u_delta/g) || []).length;
        this.nTime = (this.fragmentString.match(/u_time/g) || []).length;
        this.nDate = (this.fragmentString.match(/u_date/g) || []).length;
        this.nMouse = (this.fragmentString.match(/u_mouse/g) || []).length;
        this.animated = this.nDate > 1 || this.nTime > 1 || this.nMouse > 1;

        let vertexShader = createShader(this, this.vertexString, this.gl.VERTEX_SHADER);
        let fragmentShader = createShader(this, this.fragmentString, this.gl.FRAGMENT_SHADER);

        if (!fragmentShader) {
            fragmentShader = createShader(this, 'void main(){ gl_FragColor = vec4(1.0); }', this.gl.FRAGMENT_SHADER);
            this.isValid = false;
        } else {
            this.isValid = true;
        }

        const program = createProgram(this, [vertexShader, fragmentShader]);
        this.gl.useProgram(program);
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);

        this.program = program;
        this.change = true;
        this.BUFFER_COUNT = 0;

        const buffers = this.getBuffers(this.fragmentString);
        if (Object.keys(buffers).length) this.loadPrograms(buffers);
        this.buffers = buffers;
        this.texureIndex = this.BUFFER_COUNT;

        this.trigger('load', {});
        this.forceRender = true;
        this.render();
    }

    loadTexture(name, urlElementOrData, options = {}) {
        if (typeof urlElementOrData === 'string') options.url = urlElementOrData;
        else if (typeof urlElementOrData === 'object' && urlElementOrData.data && urlElementOrData.width) {
            options.data = urlElementOrData.data;
            options.width = urlElementOrData.width;
            options.height = urlElementOrData.height;
        } else if (typeof urlElementOrData === 'object') {
            options.element = urlElementOrData;
        }

        if (this.textures[name]) {
            this.textures[name].load(options);
        } else {
            this.textures[name] = new Texture(this.gl, name, options);
        }
        this.textures[name].on('loaded', () => { this.forceRender = true; });
    }

    setUniform(name, ...value) {
        let u = {};
        u[name] = value;
        this.setUniforms(u);
    }

    setUniforms(uniforms) {
        const parsed = parseUniforms(uniforms);
        for (let u of parsed) {
            if (u.type === 'sampler2D') {
                this.loadTexture(u.name, u.value[0]);
            } else {
                this.uniform(u.method, u.type, u.name, ...u.value);
            }
        }
        this.forceRender = true;
    }

    setMouse(mouse) {
        const rect = this.canvas.getBoundingClientRect();
        if (mouse && mouse.x >= rect.left && mouse.x <= rect.right && mouse.y >= rect.top && mouse.y <= rect.bottom) {
            const mouse_x = (mouse.x - rect.left) * this.realToCSSPixels;
            const mouse_y = this.canvas.height - (mouse.y - rect.top) * this.realToCSSPixels;
            this.uniform('2f', 'vec2', 'u_mouse', mouse_x, mouse_y);
        }
    }

    uniform(method, type, name, ...value) {
        this.uniforms[name] = this.uniforms[name] || {};
        const uniform = this.uniforms[name];
        const change = isDiff(uniform.value, value);

        if (change || this.change || !uniform.location || !uniform.value) {
            uniform.name = name;
            uniform.type = type;
            uniform.value = value;
            uniform.method = 'uniform' + method;
            this.gl.useProgram(this.program);
            uniform.location = this.gl.getUniformLocation(this.program, name);
            this.gl[uniform.method](uniform.location, ...uniform.value);

            for (let key in this.buffers) {
                const buffer = this.buffers[key];
                this.gl.useProgram(buffer.program);
                const location = this.gl.getUniformLocation(buffer.program, name);
                this.gl[uniform.method](location, ...uniform.value);
            }
        }
    }

    uniformTexture(name) {
        if (this.textures[name] !== undefined) {
            this.uniform('1i', 'sampler2D', name, this.texureIndex);
            for (let key in this.buffers) {
                const buffer = this.buffers[key];
                this.gl.useProgram(buffer.program);
                this.gl.activeTexture(this.gl.TEXTURE0 + this.texureIndex);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[name].texture);
            }
            this.gl.useProgram(this.program);
            this.gl.activeTexture(this.gl.TEXTURE0 + this.texureIndex);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[name].texture);
            this.uniform('2f', 'vec2', name + 'Resolution', this.textures[name].width, this.textures[name].height);
        }
    }

    resize() {
        if (this.width !== this.canvas.clientWidth || this.height !== this.canvas.clientHeight) {
            this.realToCSSPixels = window.devicePixelRatio || 1;
            const displayWidth = Math.floor(this.canvas.clientWidth * this.realToCSSPixels);
            const displayHeight = Math.floor(this.canvas.clientHeight * this.realToCSSPixels);

            if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
                this.canvas.width = displayWidth;
                this.canvas.height = displayHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
            this.width = this.canvas.clientWidth;
            this.height = this.canvas.clientHeight;
            this.resizeSwappableBuffers();
            return true;
        }
        return false;
    }

    render() {
        this.visible = isCanvasVisible(this.canvas);
        if (this.forceRender || this.change || (this.animated && this.visible && !this.paused)) {
            const date = new Date();
            const now = performance.now();
            this.timeDelta = (now - this.timePrev) / 1000.0;
            this.timePrev = now;

            if (this.nDelta > 1) this.uniform('1f', 'float', 'u_delta', this.timeDelta);
            if (this.nTime > 1) this.uniform('1f', 'float', 'u_time', (now - this.timeLoad) / 1000.0);
            if (this.nDate) {
                this.uniform('4f', 'float', 'u_date', date.getFullYear(), date.getMonth(), date.getDate(),
                    date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001);
            }

            this.uniform('2f', 'vec2', 'u_resolution', this.canvas.width, this.canvas.height);

            for (let key in this.buffers) {
                this.uniform('1i', 'sampler2D', this.buffers[key].name, this.buffers[key].bundle.input.index);
            }

            this.texureIndex = this.BUFFER_COUNT;
            for (let tex in this.textures) {
                this.uniformTexture(tex);
                this.texureIndex++;
            }

            this.renderPrograms();
            this.trigger('render', {});
            this.change = false;
            this.forceRender = false;
        }
    }

    renderPrograms() {
        const gl = this.gl;
        const W = gl.canvas.width;
        const H = gl.canvas.height;
        gl.viewport(0, 0, W, H);

        for (let key in this.buffers) {
            const buffer = this.buffers[key];
            buffer.bundle.render(W, H, buffer.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        gl.useProgram(this.program);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    getBuffers(fragString) {
        const buffers = {};
        if (fragString) {
            fragString.replace(/(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*BUFFER_)(\d+)(?:\s*\))|(?:#ifdef)(?:\s*BUFFER_)(\d+)(?:\s*))/gm, (match, p1, p2, p3, p4) => {
                const i = p3 || p4;
                buffers['u_buffer' + i] = { fragment: '#define BUFFER_' + i + '\n' + fragString };
            });
        }
        return buffers;
    }

    loadPrograms(buffers) {
        const gl = this.gl;
        const vertex = createShader(this, this.vertexString, gl.VERTEX_SHADER);
        for (let key in buffers) {
            const buffer = buffers[key];
            let fragment = createShader(this, buffer.fragment, gl.FRAGMENT_SHADER, 1);
            if (!fragment) fragment = createShader(this, 'void main(){ gl_FragColor = vec4(1.0); }', gl.FRAGMENT_SHADER);

            const program = createProgram(this, [vertex, fragment]);
            buffer.name = key;
            buffer.program = program;
            buffer.bundle = this.createSwappableBuffer(this.canvas.width, this.canvas.height, program);
            gl.deleteShader(fragment);
        }
        gl.deleteShader(vertex);
    }

    createSwappableBuffer(W, H, program) {
        let input = this.createBuffer(W, H, program);
        let output = this.createBuffer(W, H, program);
        const gl = this.gl;
        return {
            input, output,
            swap() {
                const temp = this.input;
                this.input = this.output;
                this.output = temp;
            },
            render(W, H, program) {
                gl.useProgram(program);
                gl.viewport(0, 0, W, H);
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.input.buffer);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output.texture, 0);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                this.swap();
            },
            resize(W, H, program) {
                gl.useProgram(program);
                gl.viewport(0, 0, W, H);
                this.input.resize(W, H);
                this.output.resize(W, H);
            }
        };
    }

    createBuffer(W, H, program) {
        const gl = this.gl;
        let index = this.BUFFER_COUNT;
        this.BUFFER_COUNT += 2;
        gl.getExtension('OES_texture_float');
        let texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        let buffer = gl.createFramebuffer();

        return {
            index, texture, buffer, W, H,
            resize(newW, newH) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
                const minW = Math.min(newW, this.W);
                const minH = Math.min(newH, this.H);
                const pixels = new Float32Array(minW * minH * 4);
                gl.readPixels(0, 0, minW, minH, gl.RGBA, gl.FLOAT, pixels);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                const newIndex = this.index + 1;
                const newTexture = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0 + newIndex);
                gl.bindTexture(gl.TEXTURE_2D, newTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newW, newH, 0, gl.RGBA, gl.FLOAT, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, minW, minH, gl.RGBA, gl.FLOAT, pixels);

                const newBuffer = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.deleteTexture(this.texture);
                gl.activeTexture(gl.TEXTURE0 + this.index);
                gl.bindTexture(gl.TEXTURE_2D, newTexture);

                this.index = newIndex;
                this.texture = newTexture;
                this.buffer = newBuffer;
                this.W = newW;
                this.H = newH;
            }
        };
    }

    resizeSwappableBuffers() {
        const gl = this.gl;
        const W = gl.canvas.width;
        const H = gl.canvas.height;
        gl.viewport(0, 0, W, H);
        for (let key in this.buffers) {
            this.buffers[key].bundle.resize(W, H, this.buffers[key].program);
        }
        gl.useProgram(this.program);
    }
}