# Java to Node.js Codebase Analyzer and Converter

## 1. Overview of the Solution

This tool is a Python script that leverages Large Language Models (LLMs) to analyze a Java codebase and convert selected parts of it to Node.js. It uses the LangChain library to structure the interaction with LLMs, supporting both Google Gemini and Anthropic Claude.

The workflow is as follows:
1.  **Scan**: The script recursively scans a specified directory for `.java` files.
2.  **Categorize**: Each Java file is categorized as a Controller, Service, DAO, Model, or Util based on its filename and content (e.g., annotations like `@Controller`).
3.  **Analyze**: The categorized files are sent to an LLM for a detailed analysis, which extracts the module's purpose, its methods, dependencies, and complexity. The results are compiled into a structured `analysis.json` file.
4.  **Convert**: Files categorized as Controller, Service, or DAO are then converted into Node.js. The tool provides specific framework targets for the conversion:
    *   **Controllers** are converted to use Express.js.
    *   **Services** are converted to standard ES6 classes.
    *   **DAOs** (Data Access Objects) are converted to use the Sequelize ORM.
5.  **Output**: The final output is saved in the `./output` directory, containing the `analysis.json` file, a summary `conversions.json`, and a `converted/` subdirectory with the new Node.js files.

## 2. Instructions to Run the Tool

### Prerequisites
*   Python 3.7+
*   An API key for either Google Gemini or Anthropic Claude.

### Setup
1.  **Install Dependencies**:
    Install the required Python packages using the `requirements.txt` file.
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configure Environment**:
    Create a `.env` file in the root of the project. This file will store your API keys and the path to the codebase you want to analyze.

    ```env
    # Your API Key for Google Gemini
    GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"

    # Or, your API key for Anthropic Claude (used as a fallback)
    # ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"

    # Path to the Java codebase to be analyzed (optional, defaults to ./java-dir)
    CODEBASE_PATH="./sakila-java"
    ```

### Execution
Run the script from your terminal:
```bash
python converter.py
```
The script will print its progress to the console and create the `output` directory with the results upon completion.

## 3. Assumptions and Limitations

### Assumptions
*   The tool assumes that the Java project follows common naming conventions (e.g., `ActorController.java`, `FilmService.java`) and uses standard annotations (`@Controller`, `@Service`, `@Repository`) for accurate file categorization.
*   It is assumed that the target technology stack for the conversion is Node.js with Express.js, ES6 classes, and Sequelize, as specified in the conversion prompts.
*   The presence of a `.env` file with valid API keys is required for the LLM to function.

### Limitations
*   **Conversion Quality**: The quality of the generated Node.js code is dependent on the LLM's ability to understand the Java code and translate it correctly. The output should be considered a starting point that requires manual review, testing, and refinement.
*   **Scope of Conversion**: The tool is designed to convert only Controller, Service, and DAO files. Other file types like Models, Entities, or utility classes are analyzed but not converted.
*   **Incomplete Analysis for Large Files**: For performance and cost reasons, the tool only analyzes the first five chunks (approximately 40,000 characters) of very large files. This may result in an incomplete analysis for modules with extensive code.
*   **No Build-System Awareness**: The script does not interpret `pom.xml` or `build.gradle` files. It has no knowledge of the project's dependencies or build process and only works with the `.java` source files.

## 4. How Token Limits Were Managed in LLM Integration

Managing token consumption is crucial for performance and cost control. This tool employs several strategies to operate within LLM token limits:

*   **Explicit Token Caps**: The `max_tokens` parameter is set during LLM initialization. It is configured to `4000` tokens for analysis tasks and `8000` for the more demanding conversion tasks.
*   **Code Chunking**: For files exceeding 10,000 characters, the `RecursiveCharacterTextSplitter` from LangChain is used. This splitter is language-aware and breaks the Java code into smaller chunks of 8000 characters. A 500-character overlap is maintained between chunks to preserve semantic context.
*   **Partial Analysis of Large Files**: To avoid excessive token usage, the analysis of large files is intentionally limited to the first five chunks. While this ensures the process completes, it may lead to an incomplete understanding of very large modules.
*   **In-Memory Caching**: The script uses `InMemoryCache` from LangChain to cache responses from the LLM. If the same file is analyzed multiple times without changes, the cached result is used, avoiding redundant API calls and reducing token usage.
*   **Two-Step Conversion Chain**: The conversion process is broken into a two-step chain using LangChain Expression Language (LCEL). First, the LLM performs a structural analysis of the Java code. Second, this analysis is provided as context to a separate prompt that performs the conversion. This modular approach helps keep each individual LLM call focused and within token limits.
