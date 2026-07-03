import { isAbsolute, resolve } from 'node:path';

export const projectRoot = resolve(__dirname, '..', '..', '..');

export function resolveUploadDir(configuredPath: string): string {
  return isAbsolute(configuredPath) ? configuredPath : resolve(projectRoot, configuredPath);
}
