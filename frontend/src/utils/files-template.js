export default {
  'index.html': {
    file: {
      contents: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>WebContainer App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
      `.trim()
    }
  },

  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'webcontainer-app',
        version: '0.0.1',
        scripts: {
          dev: 'vite'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          vite: '^4.0.0',
          '@vitejs/plugin-react': '^4.0.0'
        }
      }, null, 2)
    }
  },

  'vite.config.js': {
    file: {
      contents: `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
});
      `.trim()
    }
  },

  'src': {
    directory: {
      'main.js': {
        file: {
          contents: `
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <h1>Hello from WebContainer + React! 🎉</h1>;
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
          `.trim()
        }
      }
    }
  }
};
