
import { OtherStuff } from "./stuff/other";

export function doSomeOtherStuff () {
  console.log(OtherStuff);
}

async function main () {
  doSomeOtherStuff();
}

main();
