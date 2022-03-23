
import { ExtendedMesh, ExtendedObject3D } from "@enable3d/ammo-physics";
import { GameInput } from "@repcomm/gameinput-ts";
import { LookCamera } from "@repcomm/three.lookcamera";
import { THREE } from "enable3d";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFInstancer } from "../gltf";
import { MetaScene } from "../renderer";
import { debounce, DebounceInfo } from "../utils/debounce";
import {lerp} from "../utils/curve";
import { Quaternion, Vector3 } from "three";

const VEC3_UP = new Vector3(0, 1, 0);

const PlayerGLTF = new GLTFInstancer("./resources/first-person.glb");

const input = GameInput.get();

const DefaultPlayerMass = 10;
const DefaultMaxForwardForce = 1;
const DefaultMaxJumpForce = 40;

export class Player {
  private lookCamera: LookCamera;

  private metaScene: MetaScene;

  private instanceGLTF: GLTF;
  private mixer: THREE.AnimationMixer;
  private root: ExtendedObject3D; //ExtendedMesh;
  private fp: ExtendedObject3D;

  private walkForce: number;
  private walkForceVector: Vector3;
  private maxJumpForce: number;
  private jumpDebounce: DebounceInfo;
  private isOnGround: boolean;
  private viewDirection: Quaternion;

  private _isReady: boolean;

  private hasInstance(): boolean {
    return this.instanceGLTF !== undefined;
  }

  private isReady(): boolean {
    return this._isReady;
  }

  constructor(metaScene: MetaScene) {
    this._isReady = false;

    this.walkForce = DefaultMaxForwardForce;
    this.walkForceVector = new Vector3();
    this.maxJumpForce = DefaultMaxJumpForce;
    this.jumpDebounce = {
      timeDebounce: 500,
      timeLast: 0
    };
    this.viewDirection = new Quaternion();

    this.metaScene = metaScene;

    this.lookCamera = new LookCamera();
    this.metaScene.camera = this.lookCamera.getCamera() as any;

    PlayerGLTF.getInstance().then((instance) => {
      this.instanceGLTF = instance;

      this.mixer = new THREE.AnimationMixer(this.instanceGLTF.scene);

      this.instanceGLTF.animations.forEach((clip) => {
        this.mixer.clipAction(clip).play();
      });

      this.mixer.timeScale = 0.01;

      this.root = this.instanceGLTF.scene as any;//this.instanceGLTF.scene.getObjectByName("root") as any;
      this.root.position.set(0, 10, 0);
      this.root.add(this.lookCamera);

      this.fp = this.root.getObjectByName("fp") as any;

      this.metaScene.physics.add.existing(
        this.root as any,
        {
          shape: "box",
          width: 0.25,
          height: 1,
          depth: 0.25,
          // autoCenter: true,
          collisionFlags: 0,
          mass: DefaultPlayerMass,
          addChildren: true,
        }
      );
      this.root.body.setAngularFactor(0,0,0);


      this.root.body.on.collision((otherObject, type) => {
        this.isOnGround = type === "collision" || type === "start";
      });

      this.metaScene.scene.add(this.instanceGLTF.scene);
      this._isReady = true;
    });

  }

  update(delta: number) {
    if (!this.isReady()) return;

    let mx = input.builtinMovementConsumer.getDeltaX();
    let my = input.builtinMovementConsumer.getDeltaY();
      
    this.lookCamera.addRotationInput(
      mx,
      my
    );

    this.mixer.update(
      1
    );
  }
  control(delta: number) {
    if (!this.isReady()) return;
    // this.shape.body.setAngularVelocity(0,0,0);

    if (
      this.isOnGround &&
      input.getButtonValue("jump") &&
      debounce(this.jumpDebounce)
    ) {
      this.root.body.applyCentralImpulse(
        0, this.maxJumpForce, 0
      );
    }
    this.viewDirection.copy(this.lookCamera.quaternion);
    this.viewDirection.multiply( (this.lookCamera as any).pitch.quaternion );

    this.fp.quaternion.slerp(this.viewDirection, 0.2);
    
    // this.shapeBody.rotation.y = lerp(
    //   this.shapeBody.rotation.y,
    //   this.lookCamera.rotation.y,
    //   0.2
    // );

    //walk forward/backward
    //copy world direction
    this.fp.getWorldDirection(this.walkForceVector);
    this.walkForceVector
    // .normalize()
    //multiply by walk direction (fwd/bwd)
    .multiplyScalar(this.walkForce * input.getAxisValue("walk"));

    //apply the force
    this.root.body.applyForce(
      this.walkForceVector.x,
      this.walkForceVector.y,
      this.walkForceVector.z
    );

    //strafe left/right
    //get world direction
    this.fp.getWorldDirection(this.walkForceVector);
    this.walkForceVector
    .applyAxisAngle( VEC3_UP, Math.PI * 0.5)
    // .normalize()
    .multiplyScalar(this.walkForce * input.getAxisValue("strafe"));

    
    this.root.body.applyForce(
      this.walkForceVector.x,
      this.walkForceVector.y,
      this.walkForceVector.z,
    );

    
  }
}

