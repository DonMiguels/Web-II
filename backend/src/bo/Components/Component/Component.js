import { createComponent } from "./methods/createComponent.js";
import { getComponentById } from "./methods/getComponentById.js";
import { getComponentByCode } from "./methods/getComponentByCode.js";
import { getAllComponents } from "./methods/getAllComponents.js";
import { getComponentsByCategoria } from "./methods/getComponentsByCategoria.js";
import { updateComponent } from "./methods/updateComponent.js";
import { deleteComponent } from "./methods/deleteComponent.js";

export class Component {
  constructor() {
    this.createComponent = createComponent;
    this.getComponentById = getComponentById;
    this.getComponentByCode = getComponentByCode;
    this.getAllComponents = getAllComponents;
    this.getComponentsByCategoria = getComponentsByCategoria;
    this.updateComponent = updateComponent;
    this.deleteComponent = deleteComponent;
  }
}
