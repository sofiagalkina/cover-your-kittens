"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

console.log("Loading particles component"); // Debugging log

const Particle = () => {
  const particlesInit = useCallback(async (engine) => {
    console.log("Particles initializing..."); // Debugging log
    await loadFull(engine); // Loads all interactions, shapes, etc.
    console.log("Particles loaded!"); // Debugging log
  }, []);

  return (
    <Particles
     className="h-screen w-full z-0" // Ensuring the particles are in the background
     init={particlesInit}
      options={{
        fullScreen: { enable: false }, // Ensures it doesn't take over the entire screen unless wanted
        particles: {
          number: {
            value: 50,
          },
          size: {
            value: 10,
          },
          move: {
            enable: true,
            speed: 2,
          },
          shape: {
            type: "circle",
          },
          color: {
            value: "#FF1493", // Pink particles
          },
        },
      }}
    />
  );
};

export default Particle;
