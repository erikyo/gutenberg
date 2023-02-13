/**
 * External dependencies
 */
const AdmZip = require( 'adm-zip' );
const { sync: glob } = require( 'fast-glob' );
const { sync: packlist } = require( 'npm-packlist' );
const { dirname } = require( 'path' );
const { stdout } = require( 'process' );

/**
 * Internal dependencies
 */
const { hasPackageProp, getPackageProp, getArgFromCLI, hasArgInCLI } = require( '../utils' );

const name = getPackageProp( 'name' );

const version = getPackageProp( 'version' );

const zip = new AdmZip();

stdout.write( `Creating archive for \`${ name }\` plugin... 🎁\n\n` );

/* Adding the output directory definition */
let outDir = './';

if (hasArgInCLI('--outDir')) {
	outDir = './' + getArgFromCLI('--outDir') + '/';
}

/* If needed, this string is appended at the end of zip filename */
let filenameOpt = '';
filenameOpt += hasArgInCLI( '--with-version' ) ? '-' + version : '';

const filename = outDir + name + filenameOpt + `.zip`;
stdout.write( `Zip output destination file: ${ filename }\n` );

let files = [];
if ( hasPackageProp( 'files' ) ) {
	stdout.write(
		'Using the `files` field from `package.json` to detect files:\n\n'
	);
	files = packlist();
} else {
	stdout.write(
		'Using Plugin Handbook best practices to discover files:\n\n'
	);
	// See https://developer.wordpress.org/plugins/plugin-basics/best-practices/#file-organization.
	files = glob(
		[
			'admin/**',
			'build/**',
			'includes/**',
			'languages/**',
			'public/**',
			`${ name }.php`,
			'uninstall.php',
			'block.json',
			'changelog.*',
			'license.*',
			'readme.*',
		],
		{
			caseSensitiveMatch: false,
		}
	);
}

files.forEach( ( file ) => {
	stdout.write( `  Adding \`${ file }\`.\n` );
	const zipDirectory = dirname( file );
	zip.addLocalFile( file, zipDirectory !== '.' ? zipDirectory : '' );
} );

zip.writeZip( filename );
stdout.write( `\nDone. \`${ filename }\` is ready! 🎉\n` );
