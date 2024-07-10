import path from 'path'
import { URL, fileURLToPath } from 'url'

// Get the current directory name
export const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)