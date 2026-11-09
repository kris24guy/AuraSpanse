import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const tempRoot = await mkdtemp(path.join(tmpdir(), 'aurascope-reading-test-'))
const libDir = path.join(tempRoot, 'lib')
await mkdir(libDir, { recursive: true })
await writeFile(path.join(tempRoot, 'package.json'), JSON.stringify({ type: 'commonjs' }))

for (const file of ['emotionColors.ts', 'emotionGlossary.ts', 'personalizedEmotionReading.ts']) {
  const source = await readFile(path.join(root, 'app/lib', file), 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
  await writeFile(path.join(libDir, file.replace(/\.ts$/, '.js')), output)
}

const require = createRequire(path.join(tempRoot, 'runner.cjs'))
const { generatePersonalizedEmotionReading, PersonalizedReadingError } = require(path.join(libDir, 'personalizedEmotionReading.js'))
process.env.AURASCOPE_AI_API_KEY = 'test-only-key'
process.env.AURASCOPE_AI_MODEL = 'mock-model'
process.env.AURASCOPE_AI_BASE_URL = 'https://mock.example/v1'

const expectedDefinition = 'The mind remains caught between the wish to strike first and the need to stay still long enough to see what is real. Vigilance turns uncertainty into a warning, while a bright surge of pleasure keeps breaking through numbness. Together these forces create a charged suspension: intensity without a trusted direction, waiting for one clear fact to restore proportion.'
let callCount = 0
let requestBody
const originalFetch = globalThis.fetch
globalThis.fetch = async (url, options) => {
  callCount += 1
  assert.equal(String(url), 'https://mock.example/v1/chat/completions')
  requestBody = JSON.parse(options.body)
  return new Response(JSON.stringify({
    choices: [{
      message: {
        content: JSON.stringify({ title: 'Held Contradiction', definition: expectedDefinition }),
      },
    }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

try {
  const reading = await generatePersonalizedEmotionReading([
    { name: 'Rage', hex: '#D83A32' },
    { name: 'Serenity', hex: '#CCBAFF' },
    { name: 'Paranoia', hex: '#51405A' },
    { name: 'Ecstasy', hex: '#F2B44A' },
    { name: 'Apathy', hex: '#777777' },
  ])

  assert.equal(callCount, 1)
  assert.equal(reading.title, 'Held Contradiction')
  assert.equal(reading.definition, expectedDefinition)
  assert.equal(reading.components.length, 5)
  assert.equal(new Set(reading.components.map((item) => item.emotion)).size, 5)
  assert.deepEqual(reading.components.map((item) => item.emotion), ['Rage', 'Serenity', 'Paranoia', 'Ecstasy', 'Apathy'])
  assert.equal(reading.components[0].hex, '#D83A32')

  const modelInputs = JSON.parse(requestBody.messages[1].content)
  assert.equal(modelInputs.length, 5)
  assert.ok(modelInputs.every((item) => typeof item.definition === 'string' && item.definition.length > 10))
  assert.equal(modelInputs[0].sourceColorHex, '#D83A32')
  assert.ok(!requestBody.messages[1].content.includes('@'))
  assert.deepEqual(Object.keys(requestBody.response_format.json_schema.schema.properties).sort(), ['definition', 'title'])

  await assert.rejects(
    () => generatePersonalizedEmotionReading([
      { name: 'Rage', hex: '#D83A32' },
      { name: 'Serenity', hex: '#CCBAFF' },
      { name: 'Paranoia', hex: '#51405A' },
      { name: 'Ecstasy', hex: '#F2B44A' },
    ]),
    (error) => error instanceof PersonalizedReadingError && error.status === 422,
  )
  assert.equal(callCount, 1, 'Invalid input must not call the model provider.')

  console.log('PASS: five distinct glossary definitions produce one integrated structured reading with the exact source swatches.')
  console.log('PASS: invalid input is rejected before any model call.')
} finally {
  globalThis.fetch = originalFetch
  await rm(tempRoot, { recursive: true, force: true })
}
