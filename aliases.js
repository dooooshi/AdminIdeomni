/**
 * Create aliases for the paths
 */
const aliases = (prefix = `src`) => ({
  '@auth': `${prefix}/@auth`,
  '@i18n': `${prefix}/@i18n`,
  	'@ideomni': `${prefix}/@ideomni`,
  '@history': `${prefix}/@history`,
  '@schema': `${prefix}/@schema`,
  '@': `${prefix}`
});

export default aliases;
