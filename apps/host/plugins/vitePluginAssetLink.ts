import type { Plugin } from 'vite'
import { promises as fs } from 'fs'
import * as path from 'path'

/**
 * This plugin:
 * 1) Detects env from CI_ENVIRONMENT (fallback VITE_STAGE -> development)
 * 2) Maps env -> Android package_name via an in-code table
 * 3) Generates standard Android Asset Links JSON
 * 4) Writes to <outDir>/.well-known/assetlinks.json
 */

type AssetTarget = {
  namespace: 'android_app'
  package_name: string
  sha256_cert_fingerprints: string[]
}

type AssetLinkEntry = {
  relation: string[]
  target: AssetTarget
}

type AssetLinksPayload = AssetLinkEntry[]

function envName(): string {
  const raw = process.env.CI_ENVIRONMENT || process.env.VITE_STAGE || 'development'
  return String(raw).trim()
}

const PACKAGE_NAME_BY_ENV: Record<string, string> = {
  unstable: 'com.xtech.unstable',
  staging: 'com.xtech.stg',
  production: 'com.xtech.xbitmobile',
  prod: 'com.xtech.xbitmobile',
  development: 'com.xtech.unstable',
}

function resolvePackageName(env: string): string {
  const pkg = PACKAGE_NAME_BY_ENV[env]
  if (pkg) return pkg

  return PACKAGE_NAME_BY_ENV.production
}

function validateAssetLinks(payload: AssetLinksPayload) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('AssetLinks: payload must be a non-empty array.')
  }

  for (const entry of payload) {
    if (!entry || typeof entry !== 'object') {
      throw new Error('AssetLinks: each entry must be an object.')
    }
    if (!Array.isArray(entry.relation) || entry.relation.length === 0) {
      throw new Error('AssetLinks: each entry requires relation:string[].')
    }

    const target = entry.target
    if (!target || typeof target !== 'object') {
      throw new Error('AssetLinks: each entry requires target object.')
    }

    if (target.namespace !== 'android_app') {
      throw new Error('AssetLinks: target.namespace must be "android_app".')
    }
    if (!target.package_name) {
      throw new Error('AssetLinks: target.package_name must be a non-empty string.')
    }
    if (!Array.isArray(target.sha256_cert_fingerprints) || target.sha256_cert_fingerprints.length === 0) {
      throw new Error('AssetLinks: target.sha256_cert_fingerprints must be a non-empty string[].')
    }
  }
}

export default function vitePluginAssetLinksAuto(): Plugin {
  let outDir = 'dist'

  const writeFiles = async (body: string) => {
    const wkDir = path.join(outDir, '.well-known')
    await fs.mkdir(wkDir, { recursive: true })
    await fs.writeFile(path.join(wkDir, 'assetlinks.json'), body, 'utf-8')
  }

  const generate = async () => {
    const env = envName()
    const packageName = resolvePackageName(env)

    const payload: AssetLinksPayload = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: [
            '0A:EB:CF:40:A9:5D:80:6C:0D:FD:0B:46:64:94:84:CB:41:B6:43:6D:2E:87:C0:BF:78:D6:FC:5D:4B:B1:DE:20',
            '97:37:27:65:C2:45:68:34:54:AC:07:9F:32:E2:D1:25:ED:7C:E1:40:7D:CF:3B:05:AB:A0:CB:3C:2E:ED:2F:06',
          ],
        },
      },
    ]

    validateAssetLinks(payload)

    const isProdLike = ['production', 'prod'].includes(env.toLowerCase())
    const pretty = !isProdLike
    const body = pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload)

    await writeFiles(body)

    console.log(
      `[AssetLinks] Generated for env="${env}" with package="${packageName}" →\n` +
        `  - ${path.join(outDir, '.well-known/assetlinks.json')}`,
    )
  }

  return {
    name: 'vite-plugin-assetlinks-auto',
    apply: 'build',
    configResolved(cfg) {
      outDir = cfg.build?.outDir || outDir
    },
    async buildStart() {
      await generate()
    },
    async writeBundle() {
      await generate()
    },
  }
}
