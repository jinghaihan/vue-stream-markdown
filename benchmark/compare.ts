import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { arch, cpus, platform, release } from 'node:os'
import { resolve } from 'node:path'
import process from 'node:process'

interface Measurement {
  opsPerSecond: number
  latencyMs: number
  rmePercent: number
  samples: number
}

interface BenchmarkReport {
  success: boolean
  testResults: Array<{
    name: string
    assertionResults: Array<{
      fullName: string
      status: string
      benchmarks: Array<{
        tasks: Array<{
          name: string
          throughput: { mean: number }
          latency: { mean: number, rme: number, samplesCount: number }
        }>
      }>
    }>
  }>
}

const root = resolve(import.meta.dirname, '..')
const output = resolve(import.meta.dirname, 'results')
const rounds = Number(process.argv[2] ?? 5)
if (!Number.isSafeInteger(rounds) || rounds < 1)
  throw new Error('Run count must be a positive integer')

const measurements = new Map<string, Map<string, Measurement[]>>()
mkdirSync(output, { recursive: true })

for (let round = 1; round <= rounds; round++) {
  const reportPath = resolve(output, `round-${round}.raw.json`)
  console.error(`Comparison round ${round}/${rounds}`)
  execFileSync(process.execPath, [
    resolve(import.meta.dirname, 'node_modules/vitest/vitest.mjs'),
    'bench',
    '--run',
    'parser.bench.ts',
    'render.bench.ts',
    'code.bench.ts',
    '--reporter=default',
    '--reporter=json',
    `--outputFile.json=${reportPath}`,
  ], { cwd: import.meta.dirname, stdio: 'inherit' })

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as BenchmarkReport
  if (!report.success)
    throw new Error(`Comparison round ${round} failed`)
  for (const file of report.testResults) {
    for (const test of file.assertionResults) {
      if (test.status !== 'passed')
        throw new Error(`Comparison did not complete: ${test.fullName}`)
      const scenario = test.fullName.replace(/(?: >)? compare (?:parsers|renderers)$/, '')
      const implementations = measurements.get(scenario) ?? new Map<string, Measurement[]>()
      for (const benchmark of test.benchmarks) {
        for (const task of benchmark.tasks) {
          const values = implementations.get(task.name) ?? []
          values.push({
            opsPerSecond: task.throughput.mean,
            latencyMs: task.latency.mean,
            rmePercent: task.latency.rme,
            samples: task.latency.samplesCount,
          })
          implementations.set(task.name, values)
        }
      }
      measurements.set(scenario, implementations)
    }
  }
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

function packageVersion(path: string): string {
  return JSON.parse(readFileSync(resolve(import.meta.dirname, path, 'package.json'), 'utf8')).version
}

const scenarios = Array.from(measurements, ([name, implementations]) => ({
  name,
  implementations: Array.from(implementations, ([implementation, runs]) => {
    if (runs.length !== rounds)
      throw new Error(`Missing rounds for ${name}: ${implementation}`)
    const rates = runs.map(run => run.opsPerSecond)
    return {
      name: implementation,
      medianOpsPerSecond: median(rates),
      opsPerSecondRange: [Math.min(...rates), Math.max(...rates)],
      medianLatencyMs: median(runs.map(run => run.latencyMs)),
      runs,
    }
  }),
}))
if (scenarios.length !== 12)
  throw new Error(`Expected 12 comparison scenarios, received ${scenarios.length}`)

const summary = {
  measuredAt: new Date().toISOString(),
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  rounds,
  method: 'Built artifacts, interleaved sampling within each scenario, median throughput across independent runs. DOM rendering uses jsdom and polling timers; highlighters are warmed up, controls and animation disabled.',
  environment: { cpu: cpus()[0]?.model, platform: platform(), release: release(), arch: arch(), node: process.version },
  versions: Object.fromEntries([
    ['vue-stream-markdown', '../packages/vue'],
    ['@stream-markdown/code', '../packages/extensions/code'],
    ['@markmend/parser', '../packages/markmend/parser'],
    ['streamdown', 'node_modules/streamdown'],
    ['@streamdown/code', 'node_modules/@streamdown/code'],
    ['comark', 'node_modules/comark'],
    ['remend', 'node_modules/remend'],
    ['vue', 'node_modules/vue'],
    ['react', 'node_modules/react'],
    ['react-dom', 'node_modules/react-dom'],
    ['jsdom', 'node_modules/jsdom'],
    ['vitest', 'node_modules/vitest'],
    ['shiki', '../packages/extensions/code/node_modules/shiki'],
  ].map(([name, path]) => [name, packageVersion(path!)])),
  scenarios,
}
const summaryPath = resolve(output, 'latest.json')
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`)
console.error(`Comparison saved to ${summaryPath}`)
