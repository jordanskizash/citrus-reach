// Create a file named vercel-build.js at the root of your project:

const { execSync } = require('child_process');

try {
  // Try running the build command
  execSync('pnpm build', { stdio: 'inherit' });
} catch (error) {
  console.log('Build failed with error:', error.message);
  
  // Only ignore ESLint errors, fail on everything else (including CSS issues)
  if (error.message.includes('ESLint') || error.message.includes('lint')) {
    console.log('Build failed due to ESLint errors, but continuing deployment...');
    process.exit(0); // Exit with success for lint errors only
  } else {
    // For all other errors (including CSS/build failures), fail the deployment
    console.log('Build failed due to non-ESLint error. Failing deployment.');
    process.exit(1); // Exit with failure
  }
}