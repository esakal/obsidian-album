import {Transformer, unified} from "unified";
import moment from "moment";
export default function attacher(options: {
    coverImage: string,
    title: string,
    fromDate: string,
    toDate: string
}): Transformer {

    const fromDateLabel = moment(options.fromDate).format('DD MMMM YYYY');
    const toDateLabel = moment(options.toDate).format('DD MMMM YYYY');
    const coverAST = {
        type: 'element',
        tagName: 'div',
        properties: {className: ['cover']},
        children: [
            {
                type: 'element',
                tagName: 'div',
                properties: {className: ['image']},
                children: [
                    {
                        type: 'element',
                        tagName: 'img',
                        properties: {
                            src: options.coverImage
                        },
                        children: [],
                    },
                ],
            },
            {
                type: 'element',
                tagName: 'div',
                properties: {className: ['title']},
                children: [
                    {
                        type: 'text',
                        value: options.title,
                    }
                ],
            },
            {
                type: 'element',
                tagName: 'div',
                properties: {className: ['dates']},
                children: [
                    {
                        type: 'text',
                        value: `${fromDateLabel} - ${toDateLabel}`
                    }
                ],
            },
        ],
    };

    return async function transformer(tree: any, vfile: any) {
        tree.children = [coverAST, ...tree.children];
        return tree;
    };
}
