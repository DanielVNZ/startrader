declare module "vanta/dist/vanta.waves.min" {
    import * as THREE from "three";
  
    export interface VantaWavesOptions {
      el: HTMLElement;
      mouseControls?: boolean;
      touchControls?: boolean;
      gyroControls?: boolean;
      minHeight?: number;
      minWidth?: number;
      scale?: number;
      scaleMobile?: number;
      color?: number;
      backgroundColor?: number;
      THREE?: typeof THREE;
    }
  
    export default function WAVES(options: VantaWavesOptions): {
      destroy: () => void;
    };
  }
  