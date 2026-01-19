import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

// Mock dependencies BEFORE importing the module under test is tricky with ES modules in Node's native runner without a loader.
// However, since we are using 'node:test', we might need to rely on the fact that we can't easily mock ES module imports without a loader like 'testdouble' or similar, 
// OR we construct the test to import the helper but we might need to mock the utils it imports.

// Given the environment constraints, let's use a slightly different approach or a simple mock if the utils are exported allow overriding.
// But ES modules are read-only bindings.

// Alternative: We can use a simple manual mock pattern if the code was using dependency injection, but it's not.
// Since I cannot change the code structure heavily, I will assume we can run this test in an environment that handles basic ES modules.
// But wait, the user's backend uses `import`. Node native test runner supports this. 
// Mocking modules in native node test runner is experimental or requires loaders.

// A safer bet for the backend right now, given I don't want to install new deps, is to rely on 'cheating' by creating a test file that imports the logic 
// BUT the logic imports 'utils/index.js'.
// If I can't mock 'utils', I might trigger real translations which is bad (commands).

// Let's try to see if I can use a library like 'sinon' or just assume I can't easily mock ES modules without a build step or loader in pure Node.
// However, looking at the backend `package.json`, it has no test runner.
// I will write a standalone script that manually mocks by redefining the imported values IF possible (not possible with ESM).

// ACTUALLY: The easiest way to test `homeObjects.js` which is a pure function (mostly) but calls `translateText`...
// I will create a temporary version of `utils/index.js` or `translateTextWithPageBreak.js` inside the test directory? No, that's messy.

// Better approach:
// Create a test file `tests/homeObjects.test.js`.
// Since I can't easily mock the ESM imports without tools like `quibble` or `testdouble` (not installed),
// I will blindly trust that `translateText` handles errors gracefully or I will install a dev dependency? 
// The user asked me to "Hazlos" (Make them). I should probably use `jest` or `vitest` logic if available?
// The backend does NOT have jest/vitest. It has NOTHING.

// OK, I will create a simple test script that uses `esmock` or similar if I could, but I can't install.
// Wait, `homeObjects.js` imports `translateTextWithPageBreak`.
// The only way to test this ISOLATED without installing new deps is to use a specific technique or just run it and hope `translateText` returns empty string on failure (which it does, caught in try/catch).
// `translateText` tries to execute a command. If it fails, it returns corrected text or empty.
// If I run it on Windows, it tries `wsl`. If no WSL, it might fail.

// Let's look at `translateText.js`:
// if (process.platform === 'win32') ... wsl bash ...
// catch (error) ... return ''

// So it's safe to run! It will just return empty strings for translations.
// That is enough to verify the STRUCTURE of the object (title.es, link).
// I don't need the translation to work, just the object construction.
// So I will write a native Node test script.

import { newHomeObjectCreator } from '../src/helpers/homeObjects.js';

describe('homeObjects', () => {
  it('should process library resources correctly keeping title structure and link', async () => {
    const mockData = {
      home: {},
      generalSettings: {},
      library: {
        lactationResources: [
            { title: { es: 'Titulo 1' }, link: 'http://example.com/1' }
        ],
        // Add other fields as empty to avoid errors if code assumes they exist
        pregnancyResources: [],
        parentingResources: [],
        nutritionBlogs: [],
        archiveBlogs: []
      }
    };

    const imageHome = 'img.jpg';
    const logo = 'logo.jpg';

    // We expect translation to fail/return empty if environment is not set up, 
    // BUT we expect title.es to be preserved.
    
    // The fixed code does:
    // const titleEs = item?.title?.es || ''
    // title: { es: titleEs, gl: ... }
    
    const result = await newHomeObjectCreator(imageHome, logo, mockData);

    const resources = result.library.lactationResources;
    assert.strictEqual(resources.length, 1);
    assert.strictEqual(resources[0].title.es, 'Titulo 1');
    assert.strictEqual(resources[0].link, 'http://example.com/1');
    // We don't care about 'gl' being empty or not for this structural test
  });

   it('should handle empty or malformed resources gracefully', async () => {
    const mockData = {
      home: {},
      generalSettings: {},
      library: {
        lactationResources: null,
        pregnancyResources: [],
        parentingResources: [],
        nutritionBlogs: [],
        archiveBlogs: []
      }
    };

    const result = await newHomeObjectCreator('img', 'logo', mockData);
    assert.deepStrictEqual(result.library.lactationResources, []);
  });
});
