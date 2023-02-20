import {Transformer, unified} from "unified";
import moment from "moment";
import {boolTag} from "yaml/dist/schema/core/bool";
export default function attacher(options: {
    coverImage: string,
    title: string,
    fromDate: string,
    toDate: string
    backCover: boolean,
    extraEmptyPage: boolean
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

  const backAST = {
    type: 'element',
    tagName: 'div',
    properties: {className: ['back-cover']},
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
    ],
  };



    const emptyPageAST = {
      type: 'element',
      tagName: 'div',
      properties: {className: ['empty-page']},
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: {className: ['dates']},
          children: [
            {
              type: 'text',
              value: `.`
            }
          ],
        },
      ],
    };


    return async function transformer(tree: any, vfile: any) {
      const children = [
        coverAST,
        ...tree.children,
        options.extraEmptyPage ? emptyPageAST : null,
        options.backCover ? backAST : null,

      ].filter(Boolean);
        tree.children = children;
        return tree;
    };
}
