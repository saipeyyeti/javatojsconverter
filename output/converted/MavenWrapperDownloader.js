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

import path from 'path';
import fs from 'fs/promises'; // For async file operations
import { createWriteStream } from 'fs'; // For stream writing
import https from 'https'; // For HTTPS requests
import http from 'http';   // For HTTP requests

// --- Constants ---

/**
 * The version of the Maven Wrapper JAR to download by default.
 * @type {string}
 */
const WRAPPER_VERSION = '0.5.6';

/**
 * Default URL to download the maven-wrapper.jar from, if no 'downloadUrl' is provided in properties.
 * @type {string}
 */
const DEFAULT_DOWNLOAD_URL = `https://repo.maven.apache.org/maven2/io/takari/maven-wrapper/${WRAPPER_VERSION}/maven-wrapper-${WRAPPER_VERSION}.jar`;

/**
 * Path to the maven-wrapper.properties file, relative to the base directory.
 * This file might contain a 'wrapperUrl' property to use instead of the default one.
 * @type {string}
 */
const MAVEN_WRAPPER_PROPERTIES_PATH = '.mvn/wrapper/maven-wrapper.properties';

/**
 * Path where the maven-wrapper.jar will be saved to, relative to the base directory.
 * @type {string}
 */
const MAVEN_WRAPPER_JAR_PATH = '.mvn/wrapper/maven-wrapper.jar';

/**
 * Name of the property in `maven-wrapper.properties` which should be used to override the default download URL.
 * @type {string}
 */
const PROPERTY_NAME_WRAPPER_URL = 'wrapperUrl';

// --- Utility Functions ---

/**
 * Parses a simple Java `.properties` file format.
 * It reads key-value pairs, ignoring comments and handling basic whitespace.
 *
 * @param {string} filePath - The absolute path to the .properties file.
 * @returns {Promise<Object<string, string>>} A promise that resolves with an object containing the properties.
 * @throws {Error} If the file cannot be read or parsed.
 */
async function parsePropertiesFile(filePath) {
    const properties = {};
    try {
        const content = await fs.readFile(filePath, { encoding: 'utf8' });
        const lines = content.split(/\r?\n/);

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('#') || trimmedLine.startsWith('!')) {
                // Ignore empty lines and comments
                continue;
            }

            const eqIndex = trimmedLine.indexOf('=');
            if (eqIndex > 0) {
                const key = trimmedLine.substring(0, eqIndex).trim();
                const value = trimmedLine.substring(eqIndex + 1).trim();
                properties[key] = value;
            }
        }
    } catch (error) {
        throw new Error(`Failed to read or parse properties file '${filePath}': ${error.message}`);
    }
    return properties;
}

/**
 * Downloads a file from a given URL to a specified local destination path.
 * Supports basic HTTP authentication via username and password. Handles redirects automatically.
 *
 * @param {string} urlString - The URL of the file to download.
 * @param {string} destinationPath - The absolute path where the downloaded file should be saved.
 * @param {string} [username] - Optional username for basic HTTP authentication.
 * @param {string} [password] - Optional password for basic HTTP authentication.
 * @returns {Promise<void>} A promise that resolves when the download is complete, or rejects on error.
 */
async function downloadFile(urlString, destinationPath, username, password) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const client = url.protocol === 'https:' ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {}
        };

        if (username && password) {
            options.auth = `${username}:${password}`;
        }

        const fileStream = createWriteStream(destinationPath);

        const request = client.get(options, (response) => {
            // Handle redirects (3xx status codes)
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectUrl = new URL(response.headers.location, urlString).toString();
                console.log(`- Redirecting to: ${redirectUrl}`);
                response.destroy(); // Close current response stream
                // Recursively call downloadFile with the new URL
                downloadFile(redirectUrl, destinationPath, username, password)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // Handle non-200 OK responses
            if (response.statusCode !== 200) {
                // Clean up partial file on error
                fs.unlink(destinationPath).catch(() => {});
                reject(new Error(`Failed to download file. Status code: ${response.statusCode} - ${response.statusMessage}`));
                return;
            }

            // Pipe the response stream to the file stream
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close(); // Close the file stream
                resolve();
            });

            fileStream.on('error', (err) => {
                // Clean up partial file on error
                fs.unlink(destinationPath).catch(() => {});
                reject(new Error(`File stream error during download: ${err.message}`));
            });
        });

        request.on('error', (err) => {
            // Clean up partial file on network error
            fs.unlink(destinationPath).catch(() => {});
            reject(new Error(`Network request error during download: ${err.message}`));
        });

        // Ensure the request is ended (important for some clients, though .get usually handles it)
        request.end();
    });
}

// --- Main Downloader Logic ---

/**
 * Orchestrates the download of the Maven Wrapper JAR.
 * This function performs the following steps:
 * 1. Determines the base directory from command-line arguments.
 * 2. Reads `maven-wrapper.properties` to find a custom download URL, falling back to a default.
 * 3. Ensures the target directory for the JAR exists, creating it if necessary.
 * 4. Downloads the `maven-wrapper.jar` using the determined URL, supporting basic authentication
 *    via `MVNW_USERNAME` and `MVNW_PASSWORD` environment variables.
 * 5. Reports progress and handles errors, throwing exceptions on failure.
 *
 * @param {string} baseDirectoryPath - The path to the base directory where `.mvn/wrapper` is located.
 *                                     This path will be resolved to an absolute path.
 * @returns {Promise<void>} A promise that resolves on successful completion, or rejects on error.
 */
async function downloadMavenWrapper(baseDirectoryPath) {
    console.log('- Downloader started');
    // Resolve the base directory to an absolute path for consistent file operations
    const baseDirectory = path.resolve(baseDirectoryPath);
    console.log(`- Using base directory: ${baseDirectory}`);

    // --- 1. Determine Download URL ---
    const mavenWrapperPropertyFilePath = path.join(baseDirectory, MAVEN_WRAPPER_PROPERTIES_PATH);
    let downloadUrl = DEFAULT_DOWNLOAD_URL;

    try {
        // Check if the properties file exists before attempting to read it
        await fs.access(mavenWrapperPropertyFilePath, fs.constants.F_OK);
        console.log(`- Found properties file: ${mavenWrapperPropertyFilePath}`);
        const properties = await parsePropertiesFile(mavenWrapperPropertyFilePath);
        // Use custom URL if present, otherwise fall back to the current downloadUrl (which is DEFAULT_DOWNLOAD_URL)
        downloadUrl = properties[PROPERTY_NAME_WRAPPER_URL] || downloadUrl;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`- No custom properties file found at '${MAVEN_WRAPPER_PROPERTIES_PATH}'. Using default URL.`);
        } else {
            // Log the error but continue with the default URL, mimicking Java's behavior
            console.error(`- ERROR loading '${MAVEN_WRAPPER_PROPERTIES_PATH}': ${error.message}`);
        }
    }
    console.log(`- Downloading from: ${downloadUrl}`);

    // --- 2. Create Target Directory ---
    const outputFilePath = path.join(baseDirectory, MAVEN_WRAPPER_JAR_PATH);
    const outputDirectory = path.dirname(outputFilePath);

    try {
        // Create the directory recursively if it doesn't exist
        await fs.mkdir(outputDirectory, { recursive: true });
    } catch (error) {
        console.error(`- ERROR creating output directory '${outputDirectory}': ${error.message}`);
        throw new Error(`Failed to create output directory: ${error.message}`);
    }
    console.log(`- Downloading to: ${outputFilePath}`);

    // --- 3. Handle Authentication ---
    const username = process.env.MVNW_USERNAME;
    const password = process.env.MVNW_PASSWORD;

    if (username && password) {
        console.log('- Using MVNW_USERNAME and MVNW_PASSWORD for authentication.');
    }

    // --- 4. Download Maven Wrapper JAR ---
    try {
        await downloadFile(downloadUrl, outputFilePath, username, password);
        console.log('Done');
    } catch (error) {
        console.error('- Error downloading:');
        console.error(error.message); // Log the specific download error
        throw new Error(`Download failed: ${error.message}`);
    }
}

// --- Entry Point for Command Line Execution ---

/**
 * This block ensures that `downloadMavenWrapper` is called when the script is executed directly
 * from the command line. It parses the base directory argument and handles process exit codes.
 */
if (require.main === module) {
    const baseDirectoryArg = process.argv[2]; // The first argument after 'node script.js'

    if (!baseDirectoryArg) {
        console.error('Usage: node mavenWrapperDownloader.js <baseDirectory>');
        process.exit(1); // Exit with error code 1 if no base directory is provided
    }

    downloadMavenWrapper(baseDirectoryArg)
        .then(() => {
            process.exit(0); // Exit with success code 0
        })
        .catch((error) => {
            console.error(`\nFatal error: ${error.message}`);
            process.exit(1); // Exit with error code 1 on any unhandled error
        });
}

// --- Exports ---

/**
 * Exports the main downloader function and its utility helpers for programmatic use.
 * Also exports constants for external reference.
 */
export {
    downloadMavenWrapper,
    parsePropertiesFile,
    downloadFile,
    WRAPPER_VERSION,
    DEFAULT_DOWNLOAD_URL,
    MAVEN_WRAPPER_PROPERTIES_PATH,
    MAVEN_WRAPPER_JAR_PATH,
    PROPERTY_NAME_WRAPPER_URL
};