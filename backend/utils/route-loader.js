const path = require('path');

module.exports = function loadRoutes(routeFile) {
  const routePath = path.resolve(
    __dirname,
    '..',
    routeFile.endsWith('.js') ? routeFile : `${routeFile}.js`
  );

  try {
    // Clear any existing cache
    delete require.cache[require.resolve(routePath)];
    
    // Load the route module
    const routeModule = require(routePath);
    
    // Basic validation
    if (!routeModule || !routeModule.stack) {
      throw new Error('Loaded module is not a valid Express router');
    }
    
    return routeModule;
  } catch (err) {
    console.error(`Failed to load route file ${routePath}:`, err);
    throw err;
  }
};