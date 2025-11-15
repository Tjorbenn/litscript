import * as fs from 'fs'
import * as translators from '../translators/translators'
import * as bt from '../translators/base-translator'
import * as bl from '../block-list'

// Create a test Typst file
const testTypstContent = `/* 
# Test Typst File

This is a test Typst file to demonstrate the translator.
*/

// This is a line comment
#set page(width: 10cm, height: auto)
#set heading(numbering: "1.")

/* 
## Introduction

Typst is a new markup-based typesetting system.
*/

= Hello World

This is a simple Typst document.

/* 
## Code Example

Here's how you create a heading in Typst.
*/

#heading[My Heading]
#text[Some content]
`

// Create an OtherFile object
const typstFile: bt.OtherFile = {
    fileName: 'test.typ',
    contents: testTypstContent
}

// Create an OutputFile object
const outputFile: bt.OutputFile = {
    sourceKind: bt.SourceKind.other,
    source: typstFile,
    fullTargetPath: '/tmp/test.typ',
    relTargetPath: 'test.typ'
}

console.log("Testing Typst Translator...")
console.log("============================\n")

// Get the translator
try {
    const translator = translators.getTranslator(outputFile)
    console.log("✓ Translator retrieved successfully")
    console.log(`  Translator type: ${translator.constructor.name}`)
    
    // Get blocks
    const blocks = translator.getBlocksForFile(outputFile)
    console.log("\n✓ Blocks generated successfully")
    
    // Count and display blocks
    let blockCount = 0
    let markdownCount = 0
    let codeCount = 0
    let current = blocks
    
    while (current) {
        blockCount++
        if (current.kind === bl.BlockKind.markdown) {
            markdownCount++
            console.log(`\n[Markdown Block ${markdownCount}]`)
            console.log(current.contents.slice(0, 100) + (current.contents.length > 100 ? '...' : ''))
        } else if (current.kind === bl.BlockKind.code) {
            codeCount++
            console.log(`\n[Code Block ${codeCount}]`)
            console.log(current.contents.slice(0, 100) + (current.contents.length > 100 ? '...' : ''))
        }
        current = current.next
    }
    
    console.log(`\n\nSummary:`)
    console.log(`  Total blocks: ${blockCount}`)
    console.log(`  Markdown blocks: ${markdownCount}`)
    console.log(`  Code blocks: ${codeCount}`)
    
    if (markdownCount >= 3 && codeCount >= 3) {
        console.log("\n✓ Test PASSED: Typst translator is working correctly!")
    } else {
        console.log("\n✗ Test FAILED: Expected at least 3 markdown and 3 code blocks")
    }
} catch (error) {
    console.error("✗ Error:", error.message)
    process.exit(1)
}
