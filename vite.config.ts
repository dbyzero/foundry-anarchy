import type { UserConfig } from 'vite';
const config: UserConfig = {
    publicDir: 'public',
    base: '/systems/anarchy/',
    server: {
        port: 30001,
        open: true,
        proxy: {
            '^(?!/systems/anarchy)': 'http://localhost:12580/',
            '/socket.io': {
                target: 'ws://localhost:12580',
                ws: true,
            },
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            name: 'anarchy',
            entry: 'src/start.js',
            formats: ['es'],
            fileName: 'index'
        }
    },
}

export default config;
