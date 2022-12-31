import {SKIP, visit} from "unist-util-visit";
import {Transformer} from "unified";

export default function attacher(): Transformer {
    return function transformer(tree: any, vfile: any) {
        const flattedChildren: any[] = [];
            (tree.children || []).forEach((item: any) => {
                if (item.type !== 'paragraph') {
                    flattedChildren.push({
                        ...item,
                        isGallery: false
                    })
                } else {
                    (item.children || []).reduce((acc: any[], subItem: any) => {
                        const isChildImage = subItem.type === 'image';

                        if (acc.length === 0) {
                            acc.push({
                                type: 'paragraph',
                                isGallery: isChildImage,
                                children: [subItem]
                            })
                        } else {
                            const shouldAddToNode = acc[acc.length - 1].isGallery && isChildImage;

                            if (shouldAddToNode) {
                                acc[acc.length - 1].children.push(subItem)
                            } else {
                                acc.push({
                                    type: 'paragraph',
                                    isGallery: isChildImage,
                                    children: [subItem]
                                })
                            }
                        }

                        return acc;
                    }, flattedChildren)
                }
            })

        return {
            type: 'root',
            children: flattedChildren
        }
    };
}
