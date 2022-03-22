
import { THREE } from "enable3d";
import { AmmoPhysics, ExtendedObject3D } from "@enable3d/ammo-physics";
import { Exponent, Panel } from "@repcomm/exponent-ts";
import { Canvas } from "./components/canvas";
import { GLTFInstancer, loadGLTF } from "./gltf";
import { GameInput } from "@repcomm/gameinput-ts";
import { FlowCameraController } from "./controllers/flowcamera";
import { Player } from "./units/player";
import { LookCamera } from "@repcomm/three.lookcamera";

/**Holds info on a scene, its physics, and the camera rendering it
 * stfu, i know there can be multiple cameras.
*/
export interface MetaScene {
  scene?: THREE.Scene;
  physics?: AmmoPhysics;
  camera?: THREE.PerspectiveCamera;
  audio?: AudioContext;
}

const SKYDOME_SCENE = new GLTFInstancer("./resources/skydome.glb");

const TEST_SCENE = new GLTFInstancer("./resources/test.glb");

export class Renderer extends Panel {
  static SINGLETON: Renderer;

  private canvas: Canvas;

  private threeRenderer: THREE.WebGLRenderer;

  private defaultMetaScene: MetaScene;
  private currentMetaScene: MetaScene;

  private uiOverlay: Exponent;
  getUI (): Exponent {
    return this.uiOverlay;
  }

  constructor() {
    super();

    this.canvas = new Canvas()
      .mount(this);

    this.uiOverlay = new Exponent()
      .make("div")
      .setId("ui")
      .applyRootClasses()
      .setStyleItem("position", "absolute")
      .setStyleItem("width", "100%")
      .setStyleItem("height", "100%")
      .mount(this);

    this.threeRenderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      canvas: this.canvas.element,
      depth: true
    });
    this.threeRenderer.setClearColor(0x99ddff);

    this.threeRenderer.setPixelRatio(1)

    window.addEventListener("resize", () => {
      this.notifyScreenResized();
    });

    let scene = new THREE.Scene();

    this.defaultMetaScene = {};

    // scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0xFFFFFF));

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    scene.add(light);

    //create audio context
    this.defaultMetaScene.audio = new AudioContext({

    });

    this.defaultMetaScene.scene = scene;

    let physics = new AmmoPhysics(scene);
    physics.debug.enable();

    this.defaultMetaScene.physics = physics;

    physics.add.box(
      { x: 0, y: 10, z: 0, width: 1, height: 1, depth: 1, mass: 1, collisionFlags: 0 },
      { lambert: { color: 'red', transparent: true, opacity: 0.5 } }
    );

    SKYDOME_SCENE.getInstance().then((skydome)=>{
      scene.add(skydome.scene);
      skydome.scene.scale.set(100, 100, 100);
    });
    TEST_SCENE.getInstance().then((model)=>{
      scene.add(model.scene);
      let ground = model.scene.getObjectByName("ground");

      this.currentMetaScene.physics.add.existing(
        ground as any,
        {
          shape: "plane",
          // autoCenter: true,
          collisionFlags: 1,
          mass: 0,
          // addChildren: true
        }
      );
      
      let tree = model.scene.getObjectByName("tree");

      this.currentMetaScene.physics.add.existing(
        tree as any,
        {
          shape: "convex",
          // autoCenter: true,
          collisionFlags: 1,
          mass: 0,
          // addChildren: true
        }
      );


    });

    //set the current scene
    this.currentMetaScene = this.defaultMetaScene;
    
    let player = new Player(this.currentMetaScene);

    let input = GameInput.get();

    //keep looking until this is false
    let doRender = true;

    let last = 0;
    let delta = 0;
    let deltaSeconds = 0;

    let physicsFps = 30;
    let physicsLast = 0;
    let physicsTargetDelta = 1000 / physicsFps;
    let physicsEnlapsed = 0;

    //frame animation iteration
    const renderIteration: FrameRequestCallback = (now) => {
      let delta = now - last;
      let deltaSeconds = delta / 1000;

      //animation
      player.update(delta);
      //player controls
      player.control(deltaSeconds);

      // console.log("render");
      if (!this.currentMetaScene) return;

      if (!input.raw.pointerIsLocked()) {
        if (input.raw.getPointerButton(0)) {
          input.raw.pointerTryLock(this.canvas.element);
        }
        // lookcam.setLookEnabled(false);
      } else {
        // lookcam.setLookEnabled(true);
      }

      physicsEnlapsed += delta;
      if (physicsEnlapsed >= physicsTargetDelta) {
        physicsEnlapsed = 0;
        this.currentMetaScene.physics.update(delta);
        this.currentMetaScene.physics.updateDebugger();
      }

      this.threeRenderer.render(this.currentMetaScene.scene, this.currentMetaScene.camera);

      last = now;

      if (doRender) window.requestAnimationFrame(renderIteration);
    };
    window.requestAnimationFrame(renderIteration);

    setTimeout(() => {
      this.notifyScreenResized();
    }, 1000);

  }
  notifyScreenResized() {
    let r = this.rect;

    this.threeRenderer.setSize(r.width, r.height, false);

    this.currentMetaScene.camera.aspect = r.width / r.height;
    this.currentMetaScene.camera.updateProjectionMatrix();
  }
}
