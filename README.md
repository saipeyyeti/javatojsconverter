# Langchain based Java to Node.js Codebase Analyzer and Converter

## 1. Overview

This tool is a Python script that leverages Large Language Models (LLMs) to analyze a Java codebase and convert it to Node.js. It uses the `LangChain` library to structure the interaction with LLMs, supporting both Google Gemini and Anthropic Claude.

The script performs the following steps:
1.  **Scan**: Recursively scans a specified directory for `.java` files.
2.  **Categorize**: Each Java file is categorized as a `Controller`, `Service`, `DAO`, `Model`, or `Util` based on its filename and content.
3.  **Analyze**: The categorized files are sent to an LLM for a detailed analysis to extract the module's purpose, methods, dependencies, and complexity. The results are compiled into a structured `analysis.json` file.
4.  **Convert**: The script converts the Java files into Node.js, using framework-specific targets for different file types:
    *   **Controllers** are converted to use Express.js.
    *   **Services** are converted to standard ES6 classes.
    *   **DAOs** are converted to use the Sequelize ORM.
5.  **Output**: The final output is saved in the `./output` directory, which contains the `analysis.json` file, a `conversions.json` summary, and a `converted/` subdirectory with the new Node.js files.

## 2. Instructions

### Prerequisites
*   Python 3.7+
*   An API key for either Google Gemini or Anthropic Claude.

### Setup
1.  **Install Dependencies**:
    Install the required Python packages from `requirements.txt`.
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configure Environment**:
    Create a `.env` file in the root directory to store your API keys and the path to the codebase.

    ```env
    # Your API Key for Google Gemini
    GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"

    # Fallback API key for Anthropic Claude
    # ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"

    # Path to the Java codebase (optional, defaults to ./java-dir)
    CODEBASE_PATH="./java-dir"
    ```

### Execution
You can run the script from your terminal in two ways:

**1. Default Mode**
This will use the `CODEBASE_PATH` from your `.env` file or default to `./java-dir`.
```bash
python converter.py
```

**2. Command-Line Arguments**
You can override the default settings using command-line arguments.

*   `--codebase_path`: Specifies the path to the Java codebase.
*   `--output_dir`: Sets the directory where the output files will be saved.

```bash
python converter.py --codebase_path /path/to/your/java/project --output_dir ./custom_output
```

The script will print its progress to the console and create the output directory with the results.

## 3. Assumptions and Limitations

### Assumptions
*   The tool assumes the Java project follows standard naming conventions (e.g., `MyController.java`, `UserService.java`) and uses common annotations (`@Controller`, `@Service`) for accurate file categorization.
*   The target technology stack for the conversion is Node.js with Express.js, ES6 classes, and Sequelize.
*   A `.env` file with a valid API key is required for the LLM to function.

### Limitations
*   **Conversion Quality**: The quality of the generated Node.js code depends on the LLM's ability to understand the Java code. The output should be treated as a starting point that requires manual review and testing.
*   **Scope of Conversion**: The tool is designed to convert files with methods, but other file types like `Model`, `Entity`, or utility classes are analyzed but not guaranteed to be converted.
*   **Large File Analysis**: For performance and cost reasons, the tool analyzes only the first five chunks (approximately 40,000 characters) of very large files, which may result in an incomplete analysis.
*   **No Build-System Awareness**: The script does not interpret `pom.xml` or `build.gradle` files and has no knowledge of the project's dependencies or build process.

## 4. Token Limit Management

The tool employs several strategies to manage LLM token consumption:

*   **Explicit Token Caps**: The `max_tokens` parameter is set to `4000` for analysis and `8000` for conversion to control costs.
*   **Code Chunking**: For files over 10,000 characters, `RecursiveCharacterTextSplitter` breaks the code into 8,000-character chunks with a 500-character overlap to preserve context.
*   **Partial Analysis**: The analysis of large files is limited to the first five chunks to avoid excessive token usage.
*   **In-Memory Caching**: `InMemoryCache` is used to cache LLM responses, avoiding redundant API calls for unchanged files.
*   **Two-Step Conversion Chain**: The conversion process is broken into a two-step chain: structural analysis followed by code conversion. This keeps each LLM call focused and within token limits.
