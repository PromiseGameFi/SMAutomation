import { startAutoSplitter } from './listener/auto-splitter'

async function main() {
    try {
        await startAutoSplitter()
        // Keep alive
        setInterval(() => { }, 1000 * 60 * 60)
    } catch (error) {
        console.error('❌ Fatal Error:', error)
        process.exit(1)
    }
}

main()
