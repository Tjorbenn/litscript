/**
 * # Typst Translator
 * 
 * This translator extracts documentation from Typst files. Typst is a 
 * markup-based typesetting system similar to LaTeX. This translator treats
 * block comments <code>/&#42; ... &#42;/</code> as markdown and handles 
 * line comments `//` as part of the code.
 * 
 * Typst files use the <code>.typ</code> extension.
 */
//#region -c typst-translator imports
import * as bt from './base-translator'
//#endregion

export class TypstTranslator extends bt.Translator {
    protected createBlocks() {
        let typstFile = this.outputFile.source as bt.OtherFile
        this.splitFile(typstFile.contents, typstFile.fileName)
    }

    /**
     * Override the language method to return 'typst' for proper syntax
     * highlighting in generated documentation.
     */
    protected language(): string {
        return 'typst'
    }

    /**
     * Split Typst file into markdown blocks (from block comments) and 
     * code blocks (everything else).
     * 
     * We use a regex to match block comments and treat their contents as 
     * markdown. Everything else (including line comments) is treated as code.
     */
    private splitFile(text: string, fileName: string) {
        this.scan(text, /\/\*(.*?)\*\//gs,
            match => this.openMarkdownBlock(match[1]),
            code => this.openCodeBlock(code))
    }
}
