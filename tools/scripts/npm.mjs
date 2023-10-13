import { execSync } from 'child_process'

import devkit from '@nx/devkit'

const { readCachedProjectGraph } = devkit

function invariant(condition, message) {
  if (!condition) {
    console.error(message)
    process.exit(1)
  }
}

// Executing publish script: node path/to/publish.mjs {name} --version {version} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
const [, , name, version, tag = 'next'] = process.argv

/**
 * Check if the project name is valid
 */
const graph = readCachedProjectGraph()
const project = graph.nodes[name]

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`,
)

/**
 * Check if the version is SemVer-like
 */
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/
invariant(
  version && validVersion.test(version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`,
)

/**
 * Run the build command one more time to reflect the new version (CHANGELOG.md, package.json and git tag) in the NPM package
 */
execSync(`npm run build ${name} -- --skip-nx-cache`)

/**
 * Check if the project build target is configured correctly
 */
const outputPath = project.data?.targets?.build?.options?.outputPath
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`,
)

process.chdir(outputPath)

// Execute "npm publish" to publish
execSync(`npm publish --access public --tag ${tag}`)
