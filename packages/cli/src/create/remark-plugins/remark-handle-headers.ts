import {SKIP, visit} from "unist-util-visit";
import {Transformer} from "unified";

export default function attacher(): Transformer {
    return function transformer(tree: any, vfile: any) {

        visit(tree, 'heading', (node, index, parent) => {
            if (index === null) {
                return;
            }

            const isLastChild = parent.children.length - 1 === index;
            if (isLastChild) {
                return;
            }

            if (node.children?.[0]?.value?.startsWith('--file')) {
                node.children[0].value = node.children[0].value.replace("--file", '')
            } else {

                const sibilingNode = parent.children[index+1];

                if (sibilingNode.type === 'heading') {
                    parent.children.splice(index, 1)
                    return [SKIP, index]
                }

                node.depth++;
            }

        })


        return tree;
    };
}
