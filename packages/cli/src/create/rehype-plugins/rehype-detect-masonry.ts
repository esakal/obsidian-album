import {visit} from "unist-util-visit";
import {Transformer} from "unified";
import probe from 'probe-image-size';



async function orderByOrientation(arr: any[]) {
    const result = [...arr];
    for(let item of result) {
        if (item.tagName !== 'img') {
            item.ratio = 0;
        } else {
            const imageUrl = item?.properties?.src;
            if (!imageUrl) {
                item.ratio = 0;
            } else {
                let imageMetadata = await probe(imageUrl);
                item.ratio = imageMetadata.width / imageMetadata.height
            }
        }
    }
    result.sort((a, b) => a.ratio === b.ratio
    ? 0
    : a.ratio > b.ratio
            ? 1
            : -1)

    return result;
}
function splitToColumns(arr: any[], columnsCount: number) {
    const result = [];
    const balancedLength = arr.length > columnsCount ? Math.floor(arr.length / columnsCount) * columnsCount : arr.length;
    for(let columnNumber = 0;columnNumber < columnsCount;columnNumber++) {
        const columnItems = [];
        let innerIndex = columnNumber;
        while(innerIndex < balancedLength) {
            columnItems.push(arr[innerIndex])
            innerIndex = innerIndex+columnsCount;
        }
        if (columnItems.length) {
            result.push(columnItems)
        }
    }

    if (balancedLength !== arr.length) {
        const remainingLength = arr.length - balancedLength;
        for(let remainingIndex = 0;remainingIndex< remainingLength;remainingIndex++) {
            const calculatedIndex = balancedLength + remainingIndex;
            result[columnsCount-remainingIndex-1].push(arr[calculatedIndex])
        }
    }

    return result;
}

export default function attacher(): Transformer {
    return async function transformer(tree: any, vfile: any) {
        for(const node of tree.children) {
            if (node.tagName === 'p' && node) {
                if (node.children.every((child: any) => child.tagName === 'img')) {
                    node.tagName = 'div';
                    node.properties = node.properties || {};

                  // notice - if changing this value, should manually update default width in the css `div.gallery .gallery-column`
                  let columnCount = 4;
                    switch (node.children.length) {
                      case 1:
                        columnCount = 1;
                        break;
                      case 2:
                        columnCount = 2;
                        break;
                      case 4:
                        columnCount = 4;
                        break;
                      case 3:
                      case 5:
                      case 6:
                        columnCount = 3;
                        break;
                    }

                    node.properties.class = ((node.properties.class || '') + ` gallery gallery-${columnCount}`).trim();

                    const orderedByOrientation = await orderByOrientation(node.children);
                    const columns = splitToColumns(orderedByOrientation, columnCount)

                    node.children = columns.map(columnChildren => {
                        return {
                            type: 'element',
                            tagName: 'div',
                            properties: {class: 'gallery-column'},
                            children: columnChildren
                        };
                    });
                }
            }
        }

        return tree;
    }
}
