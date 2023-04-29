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
                      // verify each sentence ends with a dot
                        node.children[0].value = node.children[0].value.trim() + '.'
                    } else if (nodeValue === '.' || nodeValue === '...') {
                      // remove special mark . or ...
                        node.children[0].value = ''
                    }
                }
            }

            const isTextAndGallery = node?.tagName === 'p' && node.children?.[0]?.type === 'text'
                && secondNode?.type === 'text' && secondNode?.value === '\n'
                && thirdNode?.properties?.class?.includes?.('gallery')

          const isTitleAndShortContent =  node.tagName === 'h2'
            && secondNode?.type === 'text' && secondNode?.value === '\n'
            && thirdNode && thirdNode?.tagName === 'p' && thirdNode.children?.[0]?.value?.length < 500

          const isTitleAndGallery = node?.tagName === 'h2'
            && secondNode?.type === 'text' && secondNode?.value === '\n'
            && thirdNode?.properties?.class?.includes?.('gallery')


          if (isTextAndGallery) {
                tree.children.splice(i+2, 1)
                node.tagName = 'div';
                node.children.push(thirdNode);
                node.properties = node.properties || {};
                node.properties.class = ((node.properties.class || '') + ' glued-content').trim();
            } else if (isTitleAndShortContent || isTitleAndGallery) {
            tree.children.splice(i+2, 1)
            const newChild = {
              type: 'element',
              tagName: 'div',
              properties: { class: 'glued-content'},
              children: [tree.children[i], thirdNode]
            }
            tree.children[i] = newChild;
          }

        }


        return tree;
    };
}
