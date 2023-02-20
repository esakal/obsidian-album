import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkStrinfigy from 'remark-stringify';
import remarkRehype from 'remark-rehype'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import fs from 'fs';
import path from 'path';
import remarkPrepareMonntessori from './remark-plugins/remark-prepare-masonry.js';
import rehypeAddCover from './rehype-plugins/rehype-add-cover.js';
import remarkHandleHeaders from './remark-plugins/remark-handle-headers.js';
 import remarkHandleWikilinks from './remark-plugins/remark-handle-wikilinks.js';
import rehypeDetectMasonry from './rehype-plugins/rehype-detect-masonry.js';
import rehypeBindTextAndMasonry from './rehype-plugins/rehype-bind-text-and-masonry.js';
import frontmatter from 'remark-frontmatter';
import express from "express";
import processImage from "express-processimage";
import glob from "glob";
import moment from "moment";
import puppeteer, {PDFOptions} from 'puppeteer';
import * as url from 'url';
import { parse as yaml } from 'yaml';
import {rootDebug} from "../utils.js";

const __dirname: any = url.fileURLToPath(new URL('.', import.meta.url) as any);

const debug = rootDebug.extend('create')
const debugError = rootDebug.extend('create:error')


const imageServerUrl = 'http://localhost:3679';

function pdfSettings(): PDFOptions {
    const footerTemplate = `
<div style="font-size: 10px; display: flex; flex-direction: row; justify-content: center; width: 100%" id='template'>
  <div class='pageNumber' id='num' data-page="{{pageNumber}}" style="font-size: 10px;">Page number</div>
</div>`
    return {
        landscape: false,
        printBackground: false,
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate,
        margin: {
            top: 80,
            bottom: 80,
            left: 40,
            right: 40
        },
        timeout: 300000
    };
}


moment.locale('he');

function regExpEscape(value: string) {
    return value.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}

interface Options {
  debugMode: boolean,
  backCover: boolean,
  extraEmptyPage: boolean,
  vault: string,
  target: string,
  subFolder: string,
  filterBy: string,
  filterFrom: string,
  filterTo: string,
  title: string,
  coverImage: string,
}
export const create = async function(options: Options){
    const {
      target,
      debugMode,
      vault,
      subFolder,
      filterBy,
      filterFrom,
      filterTo,
      title,
      backCover,
      extraEmptyPage,
      coverImage,
    } = options;

    debug('create attachments server with port 3679');
    const app = express();
    app.use(processImage( { withMetadata: true}))
    app.use(express.static(path.join(vault, 'images')))
    app.listen(3679);

    const sourcePath = subFolder ? path.join(vault, subFolder) : vault;

    glob('*.md', { cwd: sourcePath}, async (error, fileNames) => {
        let consolidatedContent: string[] = [];

        debug('create the album source file')
        for(let fileName of fileNames) {
            const fileDateMatch = fileName.match(new RegExp(`(\\d{4}-\\d{2}-\\d{2}) ${regExpEscape(filterBy)}\.md`));
            const fileDate = fileDateMatch ? moment(fileDateMatch[1]) : null;
            if (fileDate?.isValid()
                && (!filterFrom || fileDate.isSameOrAfter(filterFrom))
                && (!filterTo || fileDate.isSameOrBefore((filterTo)))) {
                const header = fileDate.format("יום dddd, D MMMM YYYY")
                const content = fs.readFileSync(path.join(sourcePath, fileName), 'utf8');

                const file = await unified()
                    .use(remarkParse)
                    .use(remarkStrinfigy)
                    .use(frontmatter)
                    .use(() => (tree) => {
                        tree.children = tree.children.filter(child => child.type !== 'yaml');
                        return tree;
                    })
                    .process(content)


                const resolvedContent = String(file);
                consolidatedContent.push(`# --file ${header}`, '', resolvedContent);
            }
        }

        const pdfContentMarkdown = consolidatedContent.join('\n')

        debug('generate html')
        const file = await unified()
            .use(() => tree => {
                console.time('remarkParse')
                return tree;
            })
            .use(remarkParse)
            .use(() => tree => {
                console.timeEnd('remarkParse')
                console.time('remarkHandleWikilinks')
                return tree;
            })
            .use(remarkHandleWikilinks, { imageServerUrl })
            .use(() => tree => {
                console.timeEnd('remarkHandleWikilinks')
                console.time('remarkPrepareMonntessori')
                return tree;
            })
            .use(remarkPrepareMonntessori)
            .use(() => tree => {
                console.timeEnd('remarkPrepareMonntessori')
                console.time('remarkHandleHeaders')
                return tree;
            })
            .use(remarkHandleHeaders)
            .use(() => tree => {
                console.timeEnd('remarkHandleHeaders')
                console.time('remarkRehype')
                return tree;
            })
            .use(remarkRehype)
            .use(() => tree => {
                console.timeEnd('remarkRehype')
                console.time('rehypeDetectMasonry')
                return tree;
            })
            .use(rehypeDetectMasonry)
            .use(() => tree => {
                console.timeEnd('rehypeDetectMasonry')
                console.time('rehypeBindTextAndMasonry')
                return tree;
            })
            .use(rehypeBindTextAndMasonry)
            .use(() => tree => {
                console.timeEnd('rehypeBindTextAndMasonry')
                console.time('rehypeDocument')
                return tree;
            })
            .use(rehypeAddCover, { title, fromDate: filterFrom, toDate: filterTo, coverImage: `${imageServerUrl}/${coverImage}`, backCover, extraEmptyPage })
            .use(rehypeDocument, {title, language: 'he'})
            .use(() => tree => {
                console.timeEnd('rehypeDocument')
                console.time('rehypeFormat')
                return tree;
            })
            .use(rehypeFormat)
            .use(() => tree => {
                console.timeEnd('rehypeFormat')
                console.time('rehypeStringify')
                return tree;
            })
            .use(rehypeStringify)
            .use(() => tree => {
                console.timeEnd('rehypeStringify')
                return tree;
            })
            .process({
                cwd: sourcePath,
                value: pdfContentMarkdown
            })

        const html = String(file);
        // console.error(reporter(file))

        debug('prepare html document')
        const stylesContent = fs.readFileSync(path.join(__dirname, 'pdf-styles.css'), 'utf8');
        const browser = await puppeteer.launch({ headless: !debugMode, args:['--no-sandbox']});

        var [page] = await browser.pages();

        await page.setContent(html, { timeout: 10000000});

        await page.evaluate(async () => {
            const selectors = Array.from(document.querySelectorAll("img"));
            await Promise.all(selectors.map(img => {
                if (img.complete) return;
                return new Promise((resolve, reject) => {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', reject);
                });
            }));
        })
        await page.addStyleTag({content: stylesContent})
        debug('export html to pdf')
        page.pdf(pdfSettings()).then(content =>{
            debug('save to file')
            fs.writeFileSync(target, content);
            debug('pdf saved, close browser and exit')
            if (!debugMode) {
                browser.close();
                process.exit(0)
            }
        });
    });


}

