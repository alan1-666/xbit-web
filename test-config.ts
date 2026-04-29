import { Plugin } from 'vite';
import * as fs from 'fs/promises';
import * as path from 'path';

const mapping: Record<string, string> = {
  __API_KEY__: 'VITE_FIREBASE_API_KEY',
  __AUTH_DOMAIN__: 'VITE_FIREBASE_AUTH_DOMAIN',
  __PROJECT_ID__: 'VITE_FIREBASE_PROJECT_ID',
  __STORAGE_BUCKET__: 'VITE_FIREBASE_STORAGE_BUCKET',
  __MESSAGING_SENDER_ID__: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  __APP_ID__: 'VITE_FIREBASE_APP_ID',
};

export default function firebaseSwEnvLoader(): Plugin {
  const templatePath = path.resolve(__dirname, '../firebase-messaging-sw.template.js');

  /**
   * 根据当前环境获取对应的 .env 文件路径
   * 优先级：CI_ENVIRONMENT > NODE_ENV > 默认 development
   */
  const getEnvFilePath = (): string => {
    const envName = process.env.CI_ENVIRONMENT || process.env.NODE_ENV || 'development';
    console.log('envName', envName)
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


  const generateSW = async (targetPath: string): Promise<void> => {
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      const envFilePath = getEnvFilePath();
      console.log('envFilePath', envFilePath)

      console.log(`[firebase-sw-env-loader] Loading environment from: ${envFilePath}`);

      let envContent: string;
      try {
        envContent = await fs.readFile(envFilePath, 'utf-8');
      } catch (error) {
        throw new Error(`Failed to read env file at ${envFilePath}: ${error.message}`);
      }

      const envVariables: Record<string, string> = {};
      for (const [key, envVar] of Object.entries(mapping)) {
        const regex = new RegExp(`^${envVar}=(['"]?)(.*?)\\1$`, 'm');
        const match = envContent.match(regex);
        if (match?.[2]) {
          envVariables[key] = JSON.stringify(match[2]);
        } else {
          console.warn(`[WARN] Environment variable ${envVar} not found in ${envFilePath}`);
        }
      }

      const swContent = Object.entries(envVariables).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(key, 'g'), value),
        content
      );

      await fs.writeFile(targetPath, swContent, 'utf-8');
      console.log(`[firebase-sw-env-loader] Service worker generated at: ${targetPath}`);
    } catch (error) {
      console.error('[ERROR] firebase-sw-env-loader failed:', error);
      throw error;
    }
  };

  return {
    name: 'firebase-sw-env-loader',
    async buildStart() {
      await generateSW(path.resolve(__dirname, '../public/firebase-messaging-sw.js'));
    },
    async writeBundle() {
      await generateSW(path.resolve(__dirname, '../public/firebase-messaging-sw.js'));
    },
  };
}