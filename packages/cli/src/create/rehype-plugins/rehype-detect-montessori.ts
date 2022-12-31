import {visit} from "unist-util-visit";
import {Transformer} from "unified";
import probe from 'probe-image-size';

// notice - if changing this value, should manually update default width in the css `div.gallery .gallery-column`
const maxColumnCount = 4;

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
    const balancedLength = arr.length > columnsCount ? Math.floor(arr.length / maxColumnCount) * maxColumnCount : arr.length;
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
                    node.properties.class = ((node.properties.class || '') + ` gallery gallery-${node.children.length}`).trim();

                    const orderedByOrientation = await orderByOrientation(node.children);
                    const columns = splitToColumns(orderedByOrientation, maxColumnCount)

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
