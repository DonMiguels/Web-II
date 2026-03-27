import {getComponentsByCategoria} from "./getComponentsByCategoria.js";

export const getComponentByCategoria = async function({category_id}) {
    return getComponentsByCategoria({category_id});
}