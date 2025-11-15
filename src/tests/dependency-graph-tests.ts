import { test } from 'lits-extras/lib/tester'
import * as dg from '../dependency-graph'

/**
 * Tests for dependency graph functionality
 * 
 * These tests ensure that the dependency graph handles edge cases correctly:
 * - Missing dependencies (modules that don't exist in the graph)
 * - Circular dependencies (modules that depend on each other)
 * - Complex graphs with both missing and circular dependencies
 */

function resetGraph() {
    // Clear the internal graph by getting it and deleting all keys
    const graph = dg.getDependencyGraph()
    for (let key in graph) {
        delete graph[key]
    }
}

test("Dependency Graph tests", async t => {
    await t.test("Handle missing dependency at single level", async t => {
        resetGraph()
        const mod = dg.addModule('module1', 'url1')
        dg.addDependency(mod, 'nonexistent')
        
        // This should not crash or hang
        const deps = dg.allDependencies('module1')
        
        t.ok(Object.keys(deps).length === 0, 
            "No dependencies returned for missing module")
    })

    await t.test("Handle missing dependency at nested level", async t => {
        resetGraph()
        const mod1 = dg.addModule('module1', 'url1')
        const mod2 = dg.addModule('module2', 'url2')
        dg.addDependency(mod1, 'module2')
        dg.addDependency(mod2, 'nonexistent')
        
        // This should not crash or hang
        const deps = dg.allDependencies('module1')
        
        t.ok(Object.keys(deps).length === 1, 
            "Only existing dependency returned")
        t.ok(deps['module2'] !== undefined, 
            "module2 is in dependencies")
    })

    await t.test("Handle circular dependency between 2 modules", async t => {
        resetGraph()
        const modA = dg.addModule('moduleA', 'urlA')
        const modB = dg.addModule('moduleB', 'urlB')
        dg.addDependency(modA, 'moduleB')
        dg.addDependency(modB, 'moduleA')
        
        // This should not cause infinite loop
        const deps = dg.allDependencies('moduleA')
        
        t.ok(Object.keys(deps).length === 2, 
            "Both modules in circular dependency returned")
        t.ok(deps['moduleA'] !== undefined && deps['moduleB'] !== undefined,
            "Both moduleA and moduleB are in dependencies")
    })

    await t.test("Handle circular dependency between 3 modules", async t => {
        resetGraph()
        const modA = dg.addModule('moduleA', 'urlA')
        const modB = dg.addModule('moduleB', 'urlB')
        const modC = dg.addModule('moduleC', 'urlC')
        dg.addDependency(modA, 'moduleB')
        dg.addDependency(modB, 'moduleC')
        dg.addDependency(modC, 'moduleA')
        
        // This should not cause infinite loop
        const deps = dg.allDependencies('moduleA')
        
        t.ok(Object.keys(deps).length === 3, 
            "All 3 modules in circular dependency returned")
    })

    await t.test("Handle complex graph with missing and circular dependencies", async t => {
        resetGraph()
        const mod1 = dg.addModule('module1', 'url1')
        const mod2 = dg.addModule('module2', 'url2')
        const mod3 = dg.addModule('module3', 'url3')
        dg.addDependency(mod1, 'module2')
        dg.addDependency(mod1, 'nonexistent1')
        dg.addDependency(mod2, 'module3')
        dg.addDependency(mod2, 'module1') // circular
        dg.addDependency(mod3, 'nonexistent2')
        
        // This should handle both missing and circular dependencies
        const deps = dg.allDependencies('module1')
        
        t.ok(Object.keys(deps).length === 3, 
            "All existing modules returned despite missing dependencies")
        t.ok(deps['module1'] !== undefined && 
             deps['module2'] !== undefined && 
             deps['module3'] !== undefined,
            "All three modules are in dependencies")
    })

    await t.test("Normal dependency chain works correctly", async t => {
        resetGraph()
        const mod1 = dg.addModule('module1', 'url1')
        const mod2 = dg.addModule('module2', 'url2')
        const mod3 = dg.addModule('module3', 'url3')
        dg.addDependency(mod1, 'module2')
        dg.addDependency(mod2, 'module3')
        
        const deps = dg.allDependencies('module1')
        
        t.ok(Object.keys(deps).length === 2, 
            "Both dependencies in chain returned")
        t.ok(deps['module2'] !== undefined && deps['module3'] !== undefined,
            "Both module2 and module3 are in dependencies")
    })
})
