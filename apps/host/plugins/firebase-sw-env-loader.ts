import { Plugin } from 'vite'
import * as fs from 'fs/promises'
import * as path from 'path'

const mapping: Record<string, string> = {
  __API_KEY__: 'VITE_FIREBASE_API_KEY',
  __AUTH_DOMAIN__: 'VITE_FIREBASE_AUTH_DOMAIN',
  __PROJECT_ID__: 'VITE_FIREBASE_PROJECT_ID',
  __STORAGE_BUCKET__: 'VITE_FIREBASE_STORAGE_BUCKET',
  __MESSAGING_SENDER_ID__: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  __APP_ID__: 'VITE_FIREBASE_APP_ID',
}

export default function firebaseSwEnvLoader(): Plugin {
  const templatePath = path.resolve(__dirname, '../firebase-messaging-sw.template.js')

  const getEnvFilePath = (): string => {
    const envName = process.env.CI_ENVIRONMENT || process.env.NODE_ENV || 'development';
    const envFileMap: Record<string, string> = {
      unstable: '.env.unstable',
      staging: '.env.staging',
      production: '.env.prod',
      prod: '.env.prod',
      development: '.env.development',
    };
    const fileName = envFileMap[envName] || '.env';
    return path.resolve(__dirname, `../${fileName}`);
  };

  const generateSW = async (targetPath: string) => {
    const content = await fs.readFile(templatePath, 'utf-8')
    const envFilePath = getEnvFilePath();
    const envContent = await fs.readFile(envFilePath, 'utf-8')
    const envVariables: Record<string, string> = {}
    for (const [key, envVar] of Object.entries(mapping)) {
      const regex = new RegExp(`^${envVar}=(.*)$`, 'm')
      const match = envContent.match(regex)
      if (match) {
        envVariables[key] = JSON.stringify(match[1])
      } else {
        console.warn(`Environment variable ${envVar} is not defined in ${envFilePath}`)
      }
    }

    const swContent = Object.entries(envVariables).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(key, 'g'), value),
      content,
    )

    await fs.writeFile(targetPath, swContent, 'utf-8')
  }

  return {
    name: 'firebase-sw-env-loader',
    async buildStart() {
      const targetPath = path.resolve(__dirname, '../public/firebase-messaging-sw.js')
      await generateSW(targetPath)
      console.log('Firebase service worker generated at:', targetPath)
    },
    async writeBundle() {
      const targetPath = path.resolve(__dirname, '../public/firebase-messaging-sw.js')
      await generateSW(targetPath)
      console.log('Firebase service worker updated at:', targetPath)
    },
  }
}
