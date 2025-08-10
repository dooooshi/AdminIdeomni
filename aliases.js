/**
 * Create aliases for the paths
 */
const aliases = (prefix = `src`) => ({
  '@auth': `${prefix}/@auth`,
  	'@ideomni': `${prefix}/@ideomni`,
  '@history': `${prefix}/@history`,
  '@schema': `${prefix}/@schema`,
  '@': `${prefix}`
});

export default aliases;
