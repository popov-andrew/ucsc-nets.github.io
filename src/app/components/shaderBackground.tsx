"use client";

import React, { useEffect, useRef } from 'react';
import GlslCanvas from './GlslCanvas';

interface ShaderBackgroundProps {
  shaderName: string;
  uniforms?: Record<string, number | number[] | boolean>;
  className?: string;
}

export default function ShaderBackground({
  shaderName,
  uniforms = {},
  className = "",
}: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sandboxRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    let isMounted = true; // Track mount status for async safety

    // Instantiate GlslCanvas
    const sandbox = new GlslCanvas(canvasRef.current);
    sandboxRef.current = sandbox;

    // Fetch and load the fragment shader safely
    fetch(`/shaders/${shaderName}.frag`)
      .then((res) => {
        // Prevent HTML 404 pages from being parsed as GLSL
        if (!res.ok) throw new Error(`Shader not found: HTTP ${res.status}`);
        return res.text();
      })
      .then((fragmentText) => {
        // Abort if React unmounted the component before the fetch finished
        if (!isMounted || !sandbox.gl) return; 

        sandbox.load(fragmentText);

        Object.entries(uniforms).forEach(([key, value]) => {
          sandbox.setUniform(key, value);
        });
      })
      .catch((err) => console.error("Failed to load fragment shader:", err));

    const resizeObserver = new ResizeObserver(() => {
      if (sandboxRef.current && sandboxRef.current.gl) {
        sandboxRef.current.resize();
        sandboxRef.current.forceRender = true;
      }
    });

    resizeObserver.observe(containerRef.current);

    // Cleanup WebGL context and observers
    return () => {
      isMounted = false; // Flag as unmounted
      resizeObserver.disconnect();
      if (sandboxRef.current) {
        sandboxRef.current.destroy();
        sandboxRef.current = null;
      }
    };
  }, [shaderName]);

  // Dynamically update uniforms if React props change
  useEffect(() => {
    if (sandboxRef.current && sandboxRef.current.gl && uniforms) {
      Object.entries(uniforms).forEach(([key, value]) => {
        sandboxRef.current.setUniform(key, value);
      });
    }
  }, [uniforms]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden pointer-events-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover blur-xs"
        style={{ display: "block" }}
      />
    </div>
  );
}