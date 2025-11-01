"""
Java to Node.js Codebase Analyzer and Converter
Uses LangChain for advanced prompt management and structured output
Supports Google Gemini (primary) and Anthropic Claude (fallback)
"""

import os
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

# LangChain imports for text splitting, prompts, and output parsing
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.runnables import RunnablePassthrough
try:
    # Caching is used to avoid redundant API calls for the same content
    from langchain_community.cache import InMemoryCache
except ImportError:
    print("⚠️ langchain-community not installed. Caching will be disabled.")
    print("   Install with: pip install langchain-community")
    InMemoryCache = None
from langchain_core.globals import set_llm_cache
from langchain_google_genai import ChatGoogleGenerativeAI

# Pydantic is used for defining structured data models and validation
from pydantic import BaseModel, Field

# Load environment variables from a .env file
load_dotenv()

# Enable in-memory caching for LLM responses to save on API costs
if InMemoryCache:
    set_llm_cache(InMemoryCache())


# ============================================================================
# LLM INITIALIZATION
# ============================================================================

def initialize_llm(provider: str = None, temperature: float = 0.3, max_tokens: int = 4000):
    """
    Initialize the Large Language Model (LLM).

    If a provider is specified, it will be used. Otherwise, it will try to initialize
    providers in the order: Google Gemini, Anthropic Claude, OpenAI GPT.

    Args:
        provider (str, optional): 'google', 'anthropic', or 'openai'.
        temperature (float): The temperature for the LLM.
        max_tokens (int): The maximum number of tokens to generate.

    Returns:
        A tuple of (llm_instance, provider_name).

    Raises:
        ValueError: If no provider can be initialized.
    """
    
    # Define provider initialization functions
    def init_gemini():
        gemini_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
        if gemini_key:
            from langchain_google_genai import ChatGoogleGenerativeAI
            print("✅ Using Google Gemini")
            return ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=gemini_key,
                temperature=temperature,
                max_tokens=max_tokens,
            ), "Gemini"
        return None, None

    def init_anthropic():
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        if anthropic_key:
            from langchain_anthropic import ChatAnthropic
            print("✅ Using Anthropic Claude")
            return ChatAnthropic(
                anthropic_api_key=anthropic_key,
                model="claude-3-sonnet-20240229",
                temperature=temperature,
                max_tokens_to_sample=max_tokens,
                max_retries=3
            ), "Anthropic"
        return None, None

    def init_openai():
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key:
            from langchain_openai import ChatOpenAI
            print("✅ Using OpenAI GPT")
            return ChatOpenAI(
                openai_api_key=openai_key,
                model="gpt-5-codex",
                temperature=temperature,
                max_tokens=max_tokens,
            ), "OpenAI"
        return None, None

    # If a provider is specified, try to initialize it
    if provider:
        try:
            if provider == 'google':
                llm, name = init_gemini()
            elif provider == 'anthropic':
                llm, name = init_anthropic()
            elif provider == 'openai':
                llm, name = init_openai()
            else:
                raise ValueError(f"Unsupported provider: {provider}")

            if llm:
                return llm, name
            else:
                raise ValueError(f"API key for specified provider '{provider}' not found.")
        except ImportError as e:
            raise ValueError(f"Missing dependency for {provider}: {e}")
        except Exception as e:
            raise ValueError(f"Initialization failed for {provider}: {e}")

    # If no provider is specified, try them in order
    llm, name = init_gemini()
    if llm: return llm, name

    llm, name = init_anthropic()
    if llm: return llm, name

    llm, name = init_openai()
    if llm: return llm, name

    # If no provider could be initialized, raise an error
    raise ValueError(
        "No valid API key found for any provider!\n"
        "Please set GOOGLE_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY."
    )


# ============================================================================
# STRUCTURED OUTPUT MODELS (Pydantic)
# ============================================================================

class Method(BaseModel):
    """
    A Pydantic model to represent a single method within a Java class,
    including validation for the complexity field.
    """
    name: str = Field(description="Method name")
    signature: str = Field(description="Complete method signature")
    description: str = Field(description="What the method does")
    complexity: str = Field(description="Low, Medium, or High", pattern="^(Low|Medium|High)$")

class Module(BaseModel):
    """
    A Pydantic model for a Java module or class, containing a list of methods
    and dependencies.
    """
    name: str = Field(description="Module/class name")
    description: str = Field(description="Module purpose and functionality")
    methods: List[Method] = Field(description="List of methods in the module")
    dependencies: List[str] = Field(default_factory=list, description="List of dependencies")


# ============================================================================
# CODEBASE SCANNER
# ============================================================================

class CodebaseScanner:
    """
    Scans a Java codebase to identify and categorize all `.java` files.
    """
    
    @staticmethod
    def scan(root_path: str) -> List[Dict[str, Any]]:
        """
        Recursively scans the specified directory for Java files.

        Args:
            root_path (str): The root directory of the Java codebase.

        Returns:
            A list of dictionaries, where each dictionary represents a Java file.
        """
        java_files = []
        
        print(f"📂 Scanning: {root_path}")
        
        for root, dirs, files in os.walk(root_path):
            # Exclude common non-source directories to speed up scanning
            dirs[:] = [d for d in dirs if d not in ['.git', 'target', 'build', 'node_modules', '.idea']]
            
            for file in files:
                if file.endswith('.java'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Store file metadata, including its categorized type
                        java_files.append({
                            'path': file_path,
                            'name': file,
                            'content': content,
                            'type': CodebaseScanner._categorize(file, content),
                            'loc': len(content.split('\n'))
                        })
                    except Exception as e:
                        print(f"  ⚠️  Error reading {file}: {e}")
        
        print(f"✅ Found {len(java_files)} Java files\n")
        return java_files
    
    @staticmethod
    def _categorize(filename: str, content: str) -> str:
        """
        Categorizes a Java file based on common naming conventions and annotations.

        Args:
            filename (str): The name of the file.
            content (str): The content of the file.

        Returns:
            A string representing the category of the file (e.g., "Controller").
        """
        if 'Controller' in filename or '@Controller' in content or '@RestController' in content:
            return 'Controller'
        elif 'Service' in filename or '@Service' in content:
            return 'Service'
        elif 'Repository' in filename or 'DAO' in filename or '@Repository' in content:
            return 'DAO'
        elif 'Model' in filename or 'Entity' in filename or '@Entity' in content:
            return 'Model'
        elif 'DTO' in filename:
            return 'DTO'
        elif 'Config' in filename or '@Configuration' in content:
            return 'Configuration'
        elif 'Exception' in filename:
            return 'Exception'
        elif '@Component' in content:
            return 'Component'
        else:
            return 'Util'


# ============================================================================
# LANGCHAIN ANALYZER
# ============================================================================

class JavaAnalyzer:
    """
    Analyzes Java code using a LangChain pipeline, with support for structured
    output and handling of large files.
    """
    
    def __init__(self, llm, provider: str):
        """
        Initializes the analyzer with an LLM instance and a text splitter.

        Args:
            llm: The initialized LangChain LLM instance.
            provider (str): The name of the LLM provider.
        """
        self.llm = llm
        self.provider = provider
        
        # A language-aware splitter for handling large Java files
        self.text_splitter = RecursiveCharacterTextSplitter.from_language(
            language=Language.JAVA,
            chunk_size=8000,  # Aim for chunks of ~2000 tokens
            chunk_overlap=500  # Overlap to preserve context between chunks
        )
        
        # Pydantic parser for enforcing a structured JSON output
        self.module_parser = PydanticOutputParser(pydantic_object=Module)
        
        # Set up the LangChain analysis pipeline
        self._setup_analysis_chain()
    
    def _setup_analysis_chain(self):
        """
        Defines the LangChain prompt and chain for code analysis.
        """
        
        analysis_template = """You are an expert Java code analyzer. Analyze the following Java code and extract structured information.

File: {file_name}
Type: {file_type}

Code:
```java
{code}
```

{format_instructions}

Provide detailed analysis:
1. Module description - purpose and functionality
2. All methods with complete signatures, clear descriptions, and complexity estimates
3. All dependencies and imports

Return valid JSON matching the schema."""

        self.analysis_prompt = ChatPromptTemplate.from_template(analysis_template)
        self.analysis_chain = self.analysis_prompt | self.llm
    
    def analyze_file(self, file_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes a single Java file, handling large files by splitting them into chunks.

        Args:
            file_info (Dict): A dictionary containing the file's metadata.

        Returns:
            A dictionary with the structured analysis of the file.
        """
        try:
            # For large files, switch to a chunk-based analysis
            if len(file_info['content']) > 10000:
                return self._analyze_large_file(file_info)
            
            # Get formatting instructions from the Pydantic parser
            format_instructions = self.module_parser.get_format_instructions()
            
            # Invoke the analysis chain
            response = self.analysis_chain.invoke({
                "file_name": file_info['name'],
                "file_type": file_info['type'],
                "code": file_info['content'],
                "format_instructions": format_instructions
            })
            
            # Parse the LLM's response with automatic validation
            module = self.module_parser.parse(response.content)
            
            # Format the output
            return {
                "name": file_info['name'].replace('.java', ''),
                "description": module.description,
                "methods": [
                    {
                        "name": m.name,
                        "signature": m.signature,
                        "description": m.description,
                        "complexity": m.complexity
                    }
                    for m in module.methods
                ],
                "dependencies": module.dependencies,
                "linesOfCode": file_info['loc'],
                "filePath": file_info['path'],
                "type": file_info['type']
            }
            
        except Exception as e:
            print(f"  ⚠️  Analysis failed for {file_info['name']}: {str(e)[:100]}")
            # Return a fallback structure on failure
            return {
                "name": file_info['name'].replace('.java', ''),
                "description": "Analysis unavailable",
                "methods": [],
                "dependencies": [],
                "linesOfCode": file_info['loc'],
                "filePath": file_info['path'],
                "type": file_info['type']
            }
    
    def _analyze_large_file(self, file_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handles the analysis of large files by splitting them into chunks.

        Args:
            file_info (Dict): Metadata for the large file.

        Returns:
            A dictionary with the combined analysis from all chunks.
        """
        print(f"  📄 Large file detected, using chunking...")
        
        from langchain_core.documents import Document
        
        # Create a LangChain Document for splitting
        doc = Document(page_content=file_info['content'], metadata={"source": file_info['name']})
        
        # Split the document into manageable chunks
        chunks = self.text_splitter.split_documents([doc])
        print(f"  ✂️  Split into {len(chunks)} chunks")
        
        # Analyze each chunk individually
        all_methods = []
        all_dependencies = set()
        descriptions = []
        
        for i, chunk in enumerate(chunks[:5]):  # Limit to 5 chunks to manage token usage
            try:
                # A simplified prompt for analyzing individual chunks
                chunk_prompt = f"""Analyze this Java code segment:

{chunk.page_content}

Extract:
1. Method definitions (name, signature, description, complexity)
2. Import statements
3. Brief description

Return as JSON with fields: methods (array), dependencies (array), description (string)"""
                
                response = self.llm.invoke(chunk_prompt)
                
                # Extract JSON from the response
                import re
                json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
                if json_match:
                    chunk_data = json.loads(json_match.group())
                    if 'methods' in chunk_data:
                        all_methods.extend(chunk_data['methods'])
                    if 'dependencies' in chunk_data:
                        all_dependencies.update(chunk_data['dependencies'])
                    if 'description' in chunk_data:
                        descriptions.append(chunk_data['description'])
            except:
                continue
        
        # Combine the results from all chunks
        return {
            "name": file_info['name'].replace('.java', ''),
            "description": " ".join(descriptions) if descriptions else "Large module with multiple components",
            "methods": all_methods,
            "dependencies": list(all_dependencies),
            "linesOfCode": file_info['loc'],
            "filePath": file_info['path'],
            "type": file_info['type']
        }
    
    def generate_overview(self, modules: List[Dict]) -> str:
        """
        Generates a high-level project overview using a summary of the modules.

        Args:
            modules (List[Dict]): A list of analyzed modules.

        Returns:
            A string containing the project overview.
        """
        
        # Create a brief summary of the first 10 modules
        module_summary = "\n".join([
            f"- {m['name']} ({m['type']}): {m['description'][:80]}..."
            for m in modules[:10]
        ])
        
        overview_prompt = f"""Based on these Java modules, provide a concise 2-3 sentence project overview describing the architecture and purpose:

Modules:
{module_summary}

Overview:"""
        
        try:
            response = self.llm.invoke(overview_prompt)
            return response.content.strip()
        except:
            return "A Java application with a layered architecture, including controllers, services, and data access components."


# ============================================================================
# LANGCHAIN CODE CONVERTER
# ============================================================================

class CodeConverter:
    """
    Converts Java code to Node.js using a sequential LangChain chain that first
    analyzes the code and then performs the conversion.
    """
    
    def __init__(self, llm, provider: str):
        """
        Initializes the converter and sets up the conversion chain.

        Args:
            llm: An initialized LangChain LLM instance.
            provider (str): The name of the LLM provider.
        """
        self.llm = llm
        self.provider = provider
        self._setup_conversion_chain()
    
    def _setup_conversion_chain(self):
        """
        Sets up a multi-step conversion chain using LangChain Expression Language (LCEL).
        """
        
        # Step 1: A prompt to analyze the structure of the Java code
        structure_template = """Analyze the structure of this Java {module_type}:

{java_code}

Identify:
1. Main responsibilities
2. Key methods and their purposes
3. Design patterns used
4. Dependencies

Structural analysis:"""

        structure_prompt = PromptTemplate.from_template(structure_template)
        
        # Step 2: A prompt that uses the analysis to convert the code to Node.js
        conversion_template = """Based on this analysis:
{structure}

Convert this Java {module_type} to Node.js/JavaScript:

{java_code}

Requirements:
- Use {framework} framework
- Maintain all functionality
- Use async/await for asynchronous operations
- Include comprehensive JSDoc comments
- Add proper error handling
- Follow Node.js best practices

Provide only the complete, production-ready Node.js code:"""

        conversion_prompt = PromptTemplate.from_template(conversion_template)
        
        # Define the sequential chain using LCEL
        self.conversion_chain = (
            RunnablePassthrough.assign(
                structure=(structure_prompt | self.llm | StrOutputParser())
            )
            | conversion_prompt
            | self.llm
            | StrOutputParser()
        )
    
    def convert(self, java_code: str, module_type: str) -> str:
        """
        Converts a string of Java code to Node.js.

        Args:
            java_code (str): The Java code to convert.
            module_type (str): The type of the Java module (e.g., "Controller").

        Returns:
            A string containing the converted Node.js code.
        """
        
        # A mapping of Java module types to their Node.js framework equivalents
        framework_map = {
            'Controller': 'Express.js with routing and middleware',
            'Service': 'ES6 class with business logic',
            'DAO': 'Sequelize ORM for database access',
            'Model': 'ES6 class for data structure',
            'DTO': 'Plain JavaScript object for data transfer',
            'Configuration': 'Module exporting configuration objects',
            'Exception': 'Custom Error class',
            'Component': 'ES6 module or class',
            'Util': 'Collection of utility functions'
        }
        
        try:
            # Invoke the conversion chain
            nodejs_code = self.conversion_chain.invoke({
                "module_type": module_type,
                "java_code": java_code,
                "framework": framework_map.get(module_type, "Node.js patterns")
            })
            
            return self._cleanup_code(nodejs_code)
        except Exception as e:
            print(f"  ⚠️  Conversion error: {str(e)[:100]}")
            return f"// Conversion failed for {module_type}\n// Error: {str(e)}"

    @staticmethod
    def _cleanup_code(raw_code: str) -> str:
        """
        Cleans the raw LLM output to extract only the Node.js code block.

        Args:
            raw_code (str): The raw output from the LLM.

        Returns:
            A string containing just the cleaned code, or the original input if
            no code block is found.
        """
        import re

        # Regex to find a JS code block, handling optional "javascript" annotation
        match = re.search(r"```(javascript)?(.*?)```", raw_code, re.DOTALL)

        # Return the extracted code or the original string if no match is found
        return match.group(2).strip() if match else raw_code


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """
    The main execution flow of the script.
    """
    
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(description="Java to Node.js Codebase Analyzer and Converter")
    parser.add_argument("--codebase_path", help="Path to the Java codebase to be analyzed.")
    parser.add_argument("--output_dir", default="./output", help="Directory to save the output files.")
    parser.add_argument("--stage", choices=['analyze', 'convert'], help="Run a specific stage")
    parser.add_argument("--provider", choices=['google', 'anthropic', 'openai'], help="Force a specific LLM provider")
    args = parser.parse_args()

    # Determine the codebase path, prioritizing the command-line argument
    codebase_path = args.codebase_path or os.getenv('CODEBASE_PATH', './java-dir')
    output_dir = args.output_dir
    
    # Ensure output directories exist
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(f"{output_dir}/converted", exist_ok=True)
    
    print("=" * 70)
    print("🚀 Java to Node.js Converter (LangChain)")
    print("=" * 70)
    print()
    
    # Initialize the LLM
    try:
        llm, provider = initialize_llm(provider=args.provider, temperature=0.3, max_tokens=8000)
        print(f"🤖 LLM Provider: {provider}\n")
    except ValueError as e:
        print(f"❌ {e}")
        return
    
    if not args.stage or args.stage == 'analyze':
        # Step 1: Scan the codebase for Java files
        scanner = CodebaseScanner()
        java_files = scanner.scan(codebase_path)

        if not java_files:
            print(f"❌ No Java files found in {codebase_path}")
            return

        # Step 2: Analyze the Java files
        print("🧠 Analyzing Java files with LangChain...\n")
        analyzer = JavaAnalyzer(llm, provider)
        modules = []

        for i, file_info in enumerate(java_files, 1):
            print(f"  [{i}/{len(java_files)}] Analyzing {file_info['name']}...")
            module = analyzer.analyze_file(file_info)
            modules.append(module)

        # Step 3: Generate a high-level project overview
        print("\n📊 Generating project overview...")
        project_overview = analyzer.generate_overview(modules)

        # Step 4: Save the structured analysis to a JSON file
        structured_output = {
            "projectOverview": project_overview,
            "modules": modules,
            "metadata": {
                "llmProvider": provider,
                "totalFiles": len(java_files),
                "totalModules": len(modules)
            }
        }

        output_file = f"{output_dir}/analysis.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(structured_output, f, indent=2)

        print(f"✅ Saved structured analysis to: {output_file}\n")

    if not args.stage or args.stage == 'convert':
        # Step 5: Convert selected files to Node.js
        print("🔄 Converting selected files to Node.js...\n")

        # Load analysis if it exists
        analysis_file = f"{output_dir}/analysis.json"
        if not os.path.exists(analysis_file):
            print(f"❌ Analysis file not found: {analysis_file}")
            print("   Please run the 'analyze' stage first.")
            return

        with open(analysis_file, 'r', encoding='utf-8') as f:
            analysis_data = json.load(f)
        modules_to_convert = analysis_data.get('modules', [])

        # Re-initialize the LLM with settings optimized for conversion
        converter_llm, _ = initialize_llm(provider=args.provider, temperature=0.2, max_tokens=32000)
        converter = CodeConverter(converter_llm, provider)

        converted_files = []

        for module in modules_to_convert:
            if module and module.get('methods'):  # Only convert files with methods
                print(f"  Converting {module['name']} ({module['type']})...")

                try:
                    # Read the original Java file content
                    with open(module['filePath'], 'r', encoding='utf-8') as f:
                        java_code = f.read()

                    # Perform the conversion
                    nodejs_code = converter.convert(java_code, module['type'])

                    # Save the converted Node.js code
                    output_path = f"{output_dir}/converted/{module['name']}.js"
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(nodejs_code)

                    converted_files.append({
                        "original": module['name'],
                        "type": module['type'],
                        "outputPath": output_path
                    })

                    print(f"  ✅ Saved to: {output_path}\n")
                except FileNotFoundError:
                    print(f"  ⚠️  Could not find file: {module['filePath']}")
                except Exception as e:
                    print(f"  ⚠️  An unexpected error occurred for {module['name']}: {e}")
    
    # Save a summary of the conversions
    with open(f"{output_dir}/conversions.json", 'w') as f:
        json.dump({
            "llmProvider": provider,
            "conversions": converted_files
        }, f, indent=2)
    
    # Final summary
    print("=" * 70)
    print("✨ Conversion Complete!")
    print("=" * 70)
    print(f"\n🤖 LLM Provider Used: {provider}")
    print(f"📁 Output Location: {output_dir}/")
    print(f"   - analysis.json: Structured knowledge extraction")
    print(f"   - converted/: Node.js files ({len(converted_files)} files)")
    print(f"   - conversions.json: Conversion summary")
    print(f"\n🎯 Analyzed {len(modules)} modules")
    print(f"🔄 Converted {len(converted_files)} files to Node.js")
    print()


if __name__ == "__main__":
    main()
