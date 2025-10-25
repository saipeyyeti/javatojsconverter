```javascript
/*
 * Copyright 2007-present the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const fs = require('fs').promises; // Use the promise-based API for fs
const { createWriteStream } = require('fs'); // Use the callback-based createWriteStream for piping
const { URL } = require('url');
const https = require('https'); // For HTTPS requests

/**
 * The version of the Maven Wrapper to download.
 * @type {string}
 */
const WRAPPER_VERSION = "0.5.6";

/**
 * Default URL to download the maven-wrapper.jar from, if no 'downloadUrl' is provided.
 * @type {string}
 */
const DEFAULT_DOWNLOAD_URL = `https://repo.maven.apache.org/maven2/io/takari/maven-wrapper/${WRAPPER_VERSION}/maven-wrapper-${WRAPPER_VERSION}.jar`;

/**
 * Path to the maven-wrapper.properties file, which might contain a downloadUrl property to
 * use instead of the default one, relative to the base directory.
 * @type {string}
 */
const MAVEN_WRAPPER_PROPERTIES_PATH = path.join('.mvn', 'wrapper', 'maven-wrapper.properties');

/**
 * Path where the maven-wrapper.jar will be saved to, relative to the base directory.
 * @type {string}
 */
const MAVEN_WRAPPER_JAR_PATH = path.join('.mvn', 'wrapper', 'maven-wrapper.jar');

/**
 * Name of the property which should be used to override the default download url for the wrapper.
 * @type {string}
 */
const PROPERTY_NAME_WRAPPER_URL = "wrapperUrl";

/**
 * Parses a simple key=value properties file content.
 * It handles basic key-value pairs, ignoring comments (lines starting with #) and empty lines.
 *
 * @param {string} content - The content of the properties file as a string.
 * @returns {Object.<string, string>} An object containing the parsed properties.
 */
async function parseProperties(content) {
    const properties = {};
    content.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) { // Ignore comments
            const eqIndex = trimmedLine.indexOf('=');
            if (eqIndex > 0) {
                const key = trimmedLine.substring(0, eqIndex).trim();
                const value = trimmedLine.substring(eqIndex + 1).trim();
                properties[key] = value;
            }
        }
    });
    return properties;
}

/**
 * Downloads a file from a given URL to a specified destination path.
 * Supports HTTP basic authentication by checking for `MVNW_USERNAME` and `MVNW_PASSWORD`
 * environment variables.
 *
 * @param {string} urlString - The URL of the file to download.
 * @param {string} destinationPath - The local file path where the downloaded file should be saved.
 * @returns {Promise<void>} A promise that resolves when the download is complete, or rejects on error.
 * @throws {Error} If the download fails (e.g., network error, non-2xx status code, file system error).
 */
async function downloadFileFromURL(urlString, destinationPath) {
    const url = new URL(urlString);
    const protocol = url.protocol === 'https:' ? https : require('http'); // Use http for http, https for https

    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        headers: {}
    };

    const username = process.env.MVNW_USERNAME;
    const password = process.env.MVNW_PASSWORD;

    if (username && password) {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        options.headers['Authorization'] = `Basic ${auth}`;
    }

    return new Promise((resolve, reject) => {
        const request = protocol.request(options, (response) => {
            // Handle redirects (basic support for 3xx status codes)
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectUrl = new URL(response.headers.location, url); // Resolve relative redirects
                console.log(`- Redirecting to: ${redirectUrl.href}`);
                // Recursively call downloadFileFromURL with the new URL
                response.destroy(); // Close current response stream
                downloadFileFromURL(redirectUrl.href, destinationPath)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`Failed to download '${urlString}'. Status: ${response.statusCode} ${response.statusMessage}`));
            }

            const fileStream = createWriteStream(destinationPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', async (err) => {
                // Attempt to clean up partially downloaded file
                try {
                    await fs.unlink(destinationPath);
                } catch (unlinkErr) {
                    // Ignore if file doesn't exist or couldn't be unlinked
                }
                reject(new Error(`File stream error while writing to '${destinationPath}': ${err.message}`));
            });
        });

        request.on('error', (err) => {
            reject(new Error(`Network request error for '${urlString}': ${err.message}`));
        });

        request.end();
    });
}

/**
 * Main function to orchestrate the Maven Wrapper download process.
 * It determines the download URL (from properties file or default),
 * constructs the destination path, creates necessary directories,
 * and performs the download.
 *
 * This function is designed to be the entry point when the script is run directly.
 *
 * @param {string[]} args - Command-line arguments. Expects the base directory as the first argument.
 *                          e.g., `['/path/to/project']`
 * @returns {Promise<void>} A promise that resolves on successful completion or rejects on failure.
 */
async function main(args) {
    console.log("- Downloader started");

    if (args.length < 1) {
        console.error("- ERROR: Base directory argument is missing. Usage: node script.js <baseDirectory>");
        process.exit(1);
    }

    const baseDirectory = args[0];
    console.log(`- Using base directory: ${baseDirectory}`);

    const mavenWrapperPropertyFilePath = path.join(baseDirectory, MAVEN_WRAPPER_PROPERTIES_PATH);
    let downloadUrl = DEFAULT_DOWNLOAD_URL;

    try {
        const propertiesContent = await fs.readFile(mavenWrapperPropertyFilePath, 'utf8');
        const properties = await parseProperties(propertiesContent);
        downloadUrl = properties[PROPERTY_NAME_WRAPPER_URL] || downloadUrl;
        console.log(`- Custom wrapper URL found in '${MAVEN_WRAPPER_PROPERTIES_PATH}'.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`- '${MAVEN_WRAPPER_PROPERTIES_PATH}' not found, using default download URL.`);
        } else {
            console.error(`- ERROR loading '${MAVEN_WRAPPER_PROPERTIES_PATH}': ${error.message}`);
            // Continue with default URL even if properties file has issues, unless it's critical.
            // The original Java code also just prints an error and continues.
        }
    }

    console.log(`- Downloading from: ${downloadUrl}`);

    const outputFilePath = path.join(baseDirectory, MAVEN_WRAPPER_JAR_PATH);
    const outputDir = path.dirname(outputFilePath);

    try {
        await fs.mkdir(outputDir, { recursive: true });
        console.log(`- Ensured output directory exists: ${outputDir}`);
    } catch (error) {
        console.error(`- ERROR creating output directory '${outputDir}': ${error.message}`);
        process.exit(1); // Exit on failure to create directory
    }

    console.log(`- Downloading to: ${outputFilePath}`);
    try {
        await downloadFileFromURL(downloadUrl, outputFilePath);
        console.log("Done");
        process.exit(0); // Success
    } catch (error) {
        console.error("- Error downloading:");
        console.error(error.message);
        process.exit(1); // Failure
    }
}

// If this script is executed directly (e.g., `node maven-wrapper-downloader.js`),
// then call the main function with command-line arguments.
if (require.main === module) {
    // process.argv[0] is 'node', process.argv[1] is the script path
    // We need arguments starting from index 2.
    main(process.argv.slice(2));
}

/**
 * Exports utility functions and constants for potential external use or testing.
 * This makes the module a collection of utility functions.
 */
module.exports = {
    main,
    downloadFileFromURL,
    parseProperties,
    WRAPPER_VERSION,
    DEFAULT_DOWNLOAD_URL,
    MAVEN_WRAPPER_PROPERTIES_PATH,
    MAVEN_WRAPPER_JAR_PATH,
    PROPERTY_NAME_WRAPPER_URL
};
```