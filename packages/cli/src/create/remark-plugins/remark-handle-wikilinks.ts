/*
Credits to: https://github.com/TuanManhCao/digital-garden/blob/b0ea169e3768bdae272b173b96a88296447675f4/lib/obsidian-image.js
 */
import {visit} from "unist-util-visit";
import {Transformer} from "unified";

const regex = /\!\[\[((.+?)\.(jpg|jpeg|png|gif|svg|webp))(|.*?)?\]\]/gim;
//const regex2 = /\!\[\]\(((.+?)\.(jpg|jpeg|png|gif|svg|webp))\}/gim;

function convertTextNode(node: any, imageServerUrl: string) {
    const searchText = node.value;

    const regExp = new RegExp(regex);
  //  const regPxp2 = new RegExp(regex2);
    let startIndex = 0;

    let children = [];
    let match;

    while(match=regExp.exec(searchText)){
        let endIndex = match.index;

        if (startIndex < endIndex) {
            // Constructing text node from un-matched string
            const textNode = {
                // change type child node, so that visit() function won't recursively visit this node with "text" type
                type: "text-temp",
                value: searchText.substring(startIndex, endIndex),
            };
            children.push(textNode);
        }

        const imageMetadata = match[match.length-1]?.replace(' ', '').startsWith('|') ?
          `[${match[match.length-1]?.replace(' ', '').replace('|', '')}]`
          : null;

        const resizeSize = imageMetadata === '[size:full]' ? 1300 : 300;
        const imageNode = {
            type: "image",
            title: imageMetadata,
            //TODO: Use some kind of option to pass in default images path
            url: encodeURI(`${imageServerUrl}/${match[1]}?rotate&resize=,${resizeSize}`), //encode white space from file name
        };

        children.push(imageNode);

        let matchEndIndex = match.index + match[0].length + 1;
        startIndex = matchEndIndex;
    }

    if (startIndex < searchText.length) {
        const textNode = {
            type: "text-temp",
            value: searchText.substring(startIndex, searchText.length),
        };
        children.push(textNode);
    }

    return {
        type: "paragraph",
        children: children,
    };
}

export default function attacher(options: {
    imageServerUrl: string
}): Transformer {
    return function transformer(tree: any, vfile: any) {
      visit(tree, 'image', (node, index, parent) => {
        // TODO handle better ![]()
        if (node.url.startsWith('images')) {
          node.url = node.url.replace('images/', 'http://localhost:3679/')
        }
      });
        visit(tree, 'text', (node, index, parent) => {

            if (node.value.indexOf('![[') !== -1
            || node.value.indexOf('![](') !== -1) {

                const newNode = convertTextNode(node, options.imageServerUrl);
                parent.children.splice(index, 1, ...newNode.children)
            } else {
                node.value = node.value.replace(/\[\[(.*?)\]\]/g, "$1")
            }
        })

        // Change back "text-temp" node ==> "text" to clean up
        visit(tree, "text-temp", (node) => {
            node.type = "text";
        });

        return tree;
    };
}
