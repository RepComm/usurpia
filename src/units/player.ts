
import { GameInput } from "@repcomm/gameinput-ts";
import { THREE } from "enable3d";
import { ExtendedMesh } from "@enable3d/ammo-physics";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFInstancer } from "../gltf";
import { MetaScene } from "../renderer";

interface DisplayResolverInfo {
  resolve: (instance: GLTF) => void;
  unique: boolean;
}

const PlayerGLTF = new GLTFInstancer("./resources/first-person.glb");

const input = GameInput.get();

const DefaultPlayerMass = 10;
const DefaultMaxForwardForce = 80;

export class Player {

  private metaScene: MetaScene;

  private instanceGLTF: GLTF;
  private mixer: THREE.AnimationMixer;
  private hull: ExtendedMesh;

  private cameraAttachPoint: THREE.Object3D;
  private cameraLookTarget: THREE.Object3D;

  private maxForwardForce: number;

  private _isReady: boolean;

  private hasInstance(): boolean {
    return this.instanceGLTF !== undefined;
  }

  private isReady (): boolean {
    return this._isReady;
  }

  constructor(metaScene: MetaScene) {
    this._isReady = false;
    
    this.maxForwardForce = DefaultMaxForwardForce;

    this.metaScene = metaScene;

    this.cameraAttachPoint = new THREE.Object3D();
    this.cameraLookTarget = new THREE.Object3D();

    PlayerGLTF.getInstance().then((instance) => {
      this.instanceGLTF = instance;

      this.mixer = new THREE.AnimationMixer(this.instanceGLTF.scene);

      this.instanceGLTF.animations.forEach((clip) => {
        this.mixer.clipAction(clip).play();
      });

      this.mixer.timeScale = 0.01;

      // let collision = instance.scene.getObjectByName("collision");
      // collision.visible = false;
      let root = instance.scene.getObjectByName("root");
      root.position.set(0, 10, 0);

      let cameraAttachThirdPerson = instance.scene.getObjectByName("root");
      let cameraAttachFirstPerson = instance.scene.getObjectByName("root");
      // cameraAttachThirdPerson.add(this.cameraAttachPoint);
      cameraAttachFirstPerson.add(this.cameraAttachPoint);

      this.metaScene.physics.add.existing(
        root as any,
        {
          shape: "box",
          // autoCenter: true,
          collisionFlags: 0,
          mass: DefaultPlayerMass,
          addChildren: true
        }
      );
      this.hull = root as any;
      this.hull.add( this.cameraLookTarget );

      // this.hull = collision as any;

      this.metaScene.scene.add(instance.scene);
      this._isReady = true;
    });

  }

  getCameraAttachPoint(): THREE.Object3D {
    return this.cameraAttachPoint;
  }
  getCameraLookTarget (): THREE.Object3D {
    return this.cameraLookTarget;
  }

  update(delta: number) {
    if (!this.isReady()) return;
    this.mixer.update(
      1
    );
  }
  control(delta: number) {
    if (!this.isReady()) return;
    let walkCtrl = input.getAxisValue("walk");

    // this.hull.body.applyCentralForce(0, lift, 0);

    // let lookHor = input.getAxisValue("horizontal");
    // let lookVer = input.getAxisValue("vertical");

    // this.hull.body.setAngularVelocityX(0);
    // this.hull.body.setAngularVelocityZ(0);

    // this.hull.body.applyTorque(0, lookHor, 0);

    let walk = walkCtrl * this.maxForwardForce;

    this.hull.body.applyCentralLocalForce(0, 0, walk);

  }
}
