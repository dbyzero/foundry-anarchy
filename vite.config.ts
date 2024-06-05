import type { PluginOption, UserConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';


function HbsHmr(): PluginOption {
    return {
        name: 'hbs-hmr',
        enforce: 'post',
        // HMR
        handleHotUpdate({ file, server }) {
            if (file.endsWith('.hbs')) {
                // window.Hooks.callAll('rereloadTemplate');
                console.log('reloading hbs file...');

                server.ws.send(
                    'reloadTemplate',
                    file.replace(__dirname + '/public', 'systems/anarchy')
                );
            }
        },
    }
}


const config: UserConfig = {
    publicDir: 'public',
    base: '/systems/anarchy/',
    server: {
        port: 30001,
        open: true,
        proxy: {
            '^(?!/systems/anarchy)': 'http://localhost:30000/',
            '/socket.io': {
                target: 'ws://localhost:30000',
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
            fileName: 'index',
        },
    },
    plugins: [
        HbsHmr(),
        visualizer({
            gzipSize: true,
            template: "treemap",
        })
    ]
}

export default config;
