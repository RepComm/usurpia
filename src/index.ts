
import { EXPONENT_CSS_BODY_STYLES, EXPONENT_CSS_STYLES, Panel, Style } from "@repcomm/exponent-ts";
import { Renderer } from "./renderer";

EXPONENT_CSS_STYLES.mount(document.head);
EXPONENT_CSS_BODY_STYLES.mount(document.head);

const container = new Panel()
  .setId("container")
  .mount(document.body);

import { PhysicsLoader } from "enable3d";
import { GameInput } from "@repcomm/gameinput-ts";

let input = GameInput.get();

input.addJsonConfig({
  axes: [
    {
      id: "walk",
      influences: [
        {
          value: -1,
          keys: ["w"]
        },
        {
          value: 1,
          keys: ["s"]
        }
      ]
    },
    {
      id: "strafe",
      influences: [
        {
          value: -1,
          keys: ["a"]
        },
        {
          value: 1,
          keys: ["d"]
        }
      ]
    }
  ],
  buttons: [
    {
      id: "jump",
      influences: [
        {
          keys: [" "]
        }
      ]
    }
  ]
});

async function main() {
  console.log("Loaded");

  console.log("Creating renderer");
  const renderer = new Renderer()
    .setId("renderer")
    .mount(container);


}
PhysicsLoader("./lib/ammo/kripken", () => main());