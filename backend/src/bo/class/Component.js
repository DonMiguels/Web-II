import {createComponent} from "../method/createComponent.js";
import {deleteComponent} from "../method/deleteComponent.js";
import {getAllComponent} from "../method/getAllComponent.js";
import {getAllComponents} from "../method/getAllComponents.js";
import {getComponentByCategoria} from "../method/getComponentByCategoria.js";
import {getComponentsByCategoria} from "../method/getComponentsByCategoria.js";
import {updateComponent} from "../method/updateComponent.js";

export class Component {
    constructor() {
        this.createComponent = createComponent;
        this.deleteComponent = deleteComponent;
        this.getAllComponent = getAllComponent;
        this.getAllComponents = getAllComponents;
        this.getComponentByCategoria = getComponentByCategoria;
        this.getComponentsByCategoria = getComponentsByCategoria;
        this.updateComponent = updateComponent;
    }
}