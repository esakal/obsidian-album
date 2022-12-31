import {visit} from "unist-util-visit";
import {Transformer} from "unified";

export default function attacher(): Transformer {
    return function transformer(tree: any, vfile: any) {
        for(let i = 0; i< tree.children.length; i++) {
            const node = tree.children[i];
            const secondNode = tree.children[i+1]
            const thirdNode = tree.children[i+2]


            if (node?.tagName === 'p' && node.children?.[0]?.type === 'text')
            {
                const nodeValue = node.children?.[0]?.value?.trim() ?? null;
                if (typeof nodeValue === 'string')
                {
                    if (!nodeValue.endsWith('.') && nodeValue.length > 0) {
                        node.children[0].value = node.children[0].value.trim() + '.'
                    } else if (nodeValue === '.' || nodeValue === '...') {
                        node.children[0].value = ''
                    }
                }
            }

            const isTextAndGallery = node?.tagName === 'p' && node.children?.[0]?.type === 'text'
                && secondNode?.type === 'text' && secondNode?.value === '\n'
                && thirdNode?.properties?.class?.includes?.('gallery')

            const isTitleAndContent = node?.tagName === 'p' && node.children?.[0]?.tagName === 'strong'
                && secondNode?.type === 'text' && secondNode?.value === '\n'
                && thirdNode

            if (isTextAndGallery || isTitleAndContent) {

                tree.children.splice(i+2, 1)
                node.tagName = 'div';
                node.children.push(thirdNode);
                node.properties = node.properties || {};
                node.properties.class = ((node.properties.class || '') + ' glued-content').trim();
            }
        }

        return tree;
    };
}
