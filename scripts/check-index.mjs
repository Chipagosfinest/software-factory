#!/usr/bin/env node
/**
 * Fail if docs/index.json drifts from the markdown tree.
 *
 * Checks:
 * - every docs/**\/*.md file is indexed, and every indexed path exists
 * - docCount equals the docs array and the file count
 * - ids are unique, kebab-case, and match the filename
 *   (README.md hubs use the directory name as the id)
 * - kinds, parent/child inverse, relatedDocs, patterns, practitioners
 * - sources are http(s) URLs
 * - orphans: parent is null only for kind "hub"
 * - decisionMap entries point at a real pattern path
 * - relative markdown links in the repo resolve
 */

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const indexPath = path.join(root, 'docs', 'index.json')
const errors = []

const KINDS = new Set([
  'hub',
  'pattern',
  'practitioner',
  'landscape',
  'case-study',
  'signal',
  'reference',
  'project',
])

function rel(p) {
  return path.relative(root, p).split(path.sep).join('/')
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(abs, acc)
    else if (ent.name.endsWith('.md')) acc.push(rel(abs))
  }
  return acc
}

function isKebab(id) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
}

function expectedId(docPath) {
  const base = path.posix.basename(docPath)
  if (base === 'README.md') return path.posix.basename(path.posix.dirname(docPath))
  return base.replace(/\.md$/, '')
}

let index
try {
  index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
} catch (err) {
  console.error(`check:index: cannot read docs/index.json (${err.message})`)
  process.exit(1)
}

const docs = Array.isArray(index.docs) ? index.docs : null
if (!docs) errors.push('docs/index.json is missing a docs array')

const files = walk(path.join(root, 'docs')).sort()
const byId = new Map()

if (docs) {
  if (index.docCount !== docs.length) {
    errors.push(`docCount is ${index.docCount} but docs.length is ${docs.length}`)
  }
  if (index.docCount !== files.length) {
    errors.push(`docCount is ${index.docCount} but docs/**/*.md has ${files.length} files`)
  }

  const indexedPaths = new Set()
  for (const doc of docs) {
    if (!doc || typeof doc !== 'object') {
      errors.push('docs array contains a non-object entry')
      continue
    }
    if (typeof doc.id !== 'string' || !isKebab(doc.id)) {
      errors.push(`id is missing or not kebab-case: ${JSON.stringify(doc.id)}`)
    } else if (byId.has(doc.id)) {
      errors.push(`duplicate id: ${doc.id}`)
    } else {
      byId.set(doc.id, doc)
    }
    if (typeof doc.path !== 'string') {
      errors.push(`${doc.id || '(no id)'}: path is missing`)
      continue
    }
    indexedPaths.add(doc.path)
    if (!fs.existsSync(path.join(root, doc.path))) {
      errors.push(`${doc.id}: missing file ${doc.path}`)
    }
    if (doc.path !== `docs/${expectedId(doc.path)}.md` && path.posix.basename(doc.path) === 'README.md') {
      // README hubs live in a directory; expectedId is the directory name.
    }
    if (doc.id && expectedId(doc.path) !== doc.id) {
      errors.push(`${doc.id}: id does not match filename (expected ${expectedId(doc.path)} for ${doc.path})`)
    }
    if (!KINDS.has(doc.kind)) {
      errors.push(`${doc.id}: kind ${JSON.stringify(doc.kind)} is not allowed`)
    }
    if (!Array.isArray(doc.children)) {
      errors.push(`${doc.id}: children must be an array of ids`)
    }
    if (!Array.isArray(doc.relatedDocs)) {
      errors.push(`${doc.id}: relatedDocs must be an array of ids`)
    }
    if (!Array.isArray(doc.sources)) {
      errors.push(`${doc.id}: sources must be an array of URLs`)
    } else {
      for (const src of doc.sources) {
        if (typeof src !== 'string' || !/^https?:\/\//.test(src)) {
          errors.push(`${doc.id}: source is not a URL: ${JSON.stringify(src)}`)
        }
      }
    }
    const parent = doc.parent
    if (parent !== null && typeof parent !== 'string') {
      errors.push(`${doc.id}: parent must be an id or null`)
    }
    if (parent === null && doc.kind !== 'hub') {
      errors.push(`${doc.id}: orphan (no parent and kind is ${doc.kind}, not hub)`)
    }
    const patternHub = doc.kind === 'hub' && doc.path.startsWith('docs/patterns/') && doc.path.endsWith('/README.md')
    if (doc.kind === 'pattern' || patternHub) {
      if (!Array.isArray(doc.practitioners)) {
        errors.push(`${doc.id}: practitioners must be an array (pattern)`)
      }
    }
    if (doc.kind === 'practitioner') {
      if (!Array.isArray(doc.patterns) || doc.patterns.length === 0) {
        errors.push(`${doc.id}: patterns must be a non-empty array of pattern or hub ids`)
      }
    }
  }

  for (const file of files) {
    if (!indexedPaths.has(file)) errors.push(`unindexed file: ${file}`)
  }
  for (const p of indexedPaths) {
    if (!files.includes(p)) errors.push(`indexed path is not a docs markdown file: ${p}`)
  }

  for (const doc of docs) {
    if (!doc?.id) continue
    if (typeof doc.parent === 'string') {
      const parent = byId.get(doc.parent)
      if (!parent) errors.push(`${doc.id}: parent ${doc.parent} does not exist`)
      else if (!Array.isArray(parent.children) || !parent.children.includes(doc.id)) {
        errors.push(`${doc.id}: parent ${doc.parent} does not list it in children`)
      }
    }
    if (Array.isArray(doc.children)) {
      for (const childId of doc.children) {
        const child = byId.get(childId)
        if (!child) errors.push(`${doc.id}: child ${childId} does not exist`)
        else if (child.parent !== doc.id) {
          errors.push(`${doc.id}: child ${childId} has parent ${JSON.stringify(child.parent)}`)
        }
      }
    }
    if (Array.isArray(doc.relatedDocs)) {
      for (const id of doc.relatedDocs) {
        if (!byId.has(id)) errors.push(`${doc.id}: relatedDocs id ${id} does not exist`)
      }
    }
    if (Array.isArray(doc.practitioners)) {
      for (const id of doc.practitioners) {
        const target = byId.get(id)
        if (!target) errors.push(`${doc.id}: practitioners id ${id} does not exist`)
        else if (target.kind !== 'practitioner') {
          errors.push(`${doc.id}: practitioners id ${id} is kind ${target.kind}`)
        }
      }
    }
    if (Array.isArray(doc.patterns)) {
      for (const id of doc.patterns) {
        const target = byId.get(id)
        if (!target) errors.push(`${doc.id}: patterns id ${id} does not exist`)
        else if (target.kind !== 'pattern' && target.kind !== 'hub') {
          errors.push(`${doc.id}: patterns id ${id} is kind ${target.kind}`)
        }
      }
    }
    // Parent chain must reach a hub.
    const seen = new Set()
    let cursor = doc
    while (cursor && cursor.parent) {
      if (seen.has(cursor.id)) {
        errors.push(`${doc.id}: parent cycle involving ${cursor.id}`)
        break
      }
      seen.add(cursor.id)
      cursor = byId.get(cursor.parent)
    }
  }
}

if (!Array.isArray(index.decisionMap) || index.decisionMap.length === 0) {
  errors.push('decisionMap must be a non-empty array')
} else {
  for (const [i, row] of index.decisionMap.entries()) {
    for (const key of ['situation', 'pattern', 'examples', 'path']) {
      if (row[key] === undefined) errors.push(`decisionMap[${i}] missing ${key}`)
    }
    if (typeof row.situation !== 'string' || !row.situation.trim()) {
      errors.push(`decisionMap[${i}].situation must be a non-empty string`)
    }
    const pattern = byId.get(row.pattern)
    if (!pattern) errors.push(`decisionMap[${i}].pattern ${row.pattern} does not exist`)
    else if (pattern.path !== row.path) {
      errors.push(`decisionMap[${i}].path ${row.path} does not match ${pattern.id} (${pattern.path})`)
    }
    if (!Array.isArray(row.examples) || row.examples.length === 0) {
      errors.push(`decisionMap[${i}].examples must be a non-empty array`)
    } else {
      for (const id of row.examples) {
        if (!byId.has(id)) errors.push(`decisionMap[${i}].examples id ${id} does not exist`)
      }
    }
    if (typeof row.path === 'string' && !fs.existsSync(path.join(root, row.path))) {
      errors.push(`decisionMap[${i}].path missing file ${row.path}`)
    }
  }
}

function checkMarkdownLinks(file) {
  const text = fs.readFileSync(path.join(root, file), 'utf8')
  const re = /\[[^\]]*\]\(([^)\s]+)\)/g
  let match
  while ((match = re.exec(text))) {
    const raw = match[1]
    if (/^(https?:|mailto:|data:)/i.test(raw)) continue
    const urlPath = decodeURIComponent(raw.split('#')[0])
    if (!urlPath.endsWith('.md')) continue
    const abs = path.resolve(path.dirname(path.join(root, file)), urlPath)
    if (!fs.existsSync(abs)) errors.push(`${file}: broken link ${raw}`)
  }
}

const owned = []
function walkOwned(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue
    const abs = path.join(dir, ent.name)
    if (ent.isDirectory()) walkOwned(abs)
    else if (ent.name.endsWith('.md')) owned.push(rel(abs))
  }
}
walkOwned(root)
for (const file of owned) checkMarkdownLinks(file)

if (errors.length) {
  console.error(`check:index failed (${errors.length})`)
  for (const err of errors) console.error(`- ${err}`)
  process.exit(1)
}

console.log(`check:index ok (${files.length} docs, ${index.decisionMap.length} decision rows)`)
