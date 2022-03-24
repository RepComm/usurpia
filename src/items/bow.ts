
import { Item, ItemDisplayRegistry, ItemDisplayType } from "./item";

const id = "weapon:bow";

if (!Item.isRegistered(id)) {
  ItemDisplayRegistry.register({
    id: `${id}:icon`,
    type: ItemDisplayType.icon,
    url: "./resources/bow.png "
  });
  ItemDisplayRegistry.register({
    id: `${id}:model`,
    type: ItemDisplayType.model,
    url: "./resources/bow.glb"
  });

  Item.register({
    id,
    displays: {
      icon: {
        id: `${id}:icon`,
        type: ItemDisplayType.icon
      },
      model: {
        id: `${id}:model`,
        type: ItemDisplayType.model
      }
    }
  });
}

export function createItemBow () {
  return Item.instantiate(id);
}
