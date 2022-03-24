
import type { AmmoPhysics } from "@enable3d/ammo-physics";
import { Object3D } from "three";

export const USERDATA_KEY = "structure.data";

export interface Structure {

}

export function userDataHasStructure (o: Object3D): boolean {
  return (
    o &&
    o.userData &&
    o.userData[USERDATA_KEY]
  );
}

function structureModelPass (model: Object3D, physics: AmmoPhysics) {
  model.traverse((child)=>{
    child.userData
  });
  // physics.add.existing()
}
