

//makes item depend on DOM APIs
export type ItemIcon = HTMLImageElement;

//makes item depend on three APIs
import type { Object3D } from "three";
export type ItemModel = Object3D;

export function objectCopy<T>(src: T): T {
  let propNames = Object.getOwnPropertyNames(src);

  //@ts-expect-error
  let result: T = {};
  for (let propName of propNames) {
    result[propName] = src[propName];
  }

  return result;
}

export interface ItemDisplay extends ItemDisplayJson {
  url: string;
}

export const ItemDisplayRegistry = {
  displays: new Map<ItemDisplayId, ItemDisplay>(),
  
  register (itemDisplayJson: ItemDisplay): Promise<void> {
    return new Promise(async (_resolve, _reject)=>{

    });
  }
};

export type ItemDisplayId = string;

export type ItemId = string;

export enum ItemDisplayType {
  icon,
  model
}

export interface ItemDisplayJson {
  type: ItemDisplayType;
  id: ItemDisplayId;
}

export interface ItemDisplaysJson {
  icon: ItemDisplayJson;
  model: ItemDisplayJson;
}

export interface ItemJson {
  id: ItemId;
  displays: ItemDisplaysJson;
}

export function ItemJsonCopy(src: ItemJson): ItemJson {
  return objectCopy(src);
}

export type ItemRegistry = Map<ItemId, ItemJson>;
export type ItemPool = Set<Item>;
export enum ItemCategoryEnum {
  raw,
  consumable,
  tool,
  weapon
}

export enum ItemActionEnum {
  /**when this instance of callback is added to the item*/
  activate,
  /**when this instance of callback is removed from the item*/
  deactivate,
  /**when this item is 'used' in some way*/
  action
}
export interface ItemActionCallback {
  /**
   * Return false to request cancellation of whatever happens
   * do to the use of this item
   */
  (type: ItemActionEnum): boolean;
}

export enum ItemDisplaySetEnum {
  /**when this instance of callback is added to the item*/
  activate,
  /**when this instance of callback is removed from the item*/
  deactivate,
  /**when this item should have its display updated*/
  action
}
export interface ItemDisplaySetCallback {
  (type: ItemDisplaySetEnum, item?: Item): void;
}

export class Item {
  private _id: ItemId;
  get id(): ItemId {
    return this._id;
  }
  private _category: ItemCategoryEnum;
  /**Item category*/
  get category(): ItemCategoryEnum {
    return this._category;
  }

  private _itemDisplaySetCallback: ItemDisplaySetCallback;
  hasItemDisplaySetCallback(): boolean {
    return this._itemDisplaySetCallback != undefined &&
    this._itemDisplaySetCallback != null;
  }
  get itemDisplaySetCallback (): ItemDisplaySetCallback {
    return this._itemDisplaySetCallback;
  }
  set itemDisplaySetCallback (cb: ItemDisplaySetCallback) {
    if (this.hasItemDisplaySetCallback) this.itemDisplaySetCallback(ItemDisplaySetEnum.deactivate);
    this._itemDisplaySetCallback = cb;
    cb(ItemDisplaySetEnum.activate);

    //if we have a current display, notify immediately
    //helpful for when a player wants to render an item
    //but doesn't want to do crazy code to wait for a display
    if (this.displays) cb(ItemDisplaySetEnum.action, this);
  }
  
  private _itemActionCallback: ItemActionCallback;
  get itemAction(): ItemActionCallback {
    return this._itemActionCallback;
  }
  get hasItemAction(): boolean {
    return this._itemActionCallback !== undefined && this._itemActionCallback !== null;
  }
  set itemAction(cb: ItemActionCallback) {
    if (this.hasItemAction) this._itemActionCallback(ItemActionEnum.deactivate);
    this._itemActionCallback = cb;
    cb(ItemActionEnum.activate);
  }

  private _displays: ItemDisplaysJson;
  get displays (): ItemDisplaysJson {
    return this._displays;
  }
  set displays (d: ItemDisplaysJson) {
    this._displays = objectCopy(d);
    if (this.hasItemDisplaySetCallback) {
      this.itemDisplaySetCallback(ItemDisplaySetEnum.action);
    }
  }

  private static _unusedItemPool: ItemPool;
  private static _registry: ItemRegistry;
  static get registry(): ItemRegistry {
    if (!Item._registry) Item._registry = new Map();
    return Item._registry;
  }
  static get unusedItemPool(): ItemPool {
    if (!Item._unusedItemPool) Item._unusedItemPool = new Set();
    return Item._unusedItemPool;
  }
  static aquireItem(): Item {
    let result: Item;
    for (let item of this.unusedItemPool) {
      result = item;
      break;
    }
    if (!result) result = new Item();
    return result;
  }
  static recycleItem(item: Item) {
    this.unusedItemPool.add(item);
  }
  static register(itemJson: ItemJson): Promise<void> {
    return new Promise(async (_resolve, _reject) => {
      if (this.registry.has(itemJson.id)) {
        _reject(`cannot register item, id '${itemJson.id}' previously registered!`);
        return;
      }
      this.registry.set(itemJson.id, itemJson);
    });
  }
  static isRegistered(itemId: ItemId): boolean {
    return this.registry.has(itemId);
  }
  static instantiate(itemId: ItemId): Item {
    return Item.fromItemJson(
      this.registry.get(itemId)
    );
  }
  static fromItemJson(itemJson: ItemJson): Item {
    let result = Item.aquireItem();

    result._id = itemJson.id;

    return result;
  }
}

async function test () {
  let itemJson: ItemJson = {
    id: "dev:test",
    displays: {
      icon: undefined,
      model: undefined
    }
  };

  await Item.register(itemJson);

  let item = Item.instantiate(itemJson.id);
  item.itemDisplaySetCallback = (type, item)=>{
    
    //listen to display set/changes only
    if (type !== ItemDisplaySetEnum.action) return;

  };
}
