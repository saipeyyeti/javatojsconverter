"""
Java to Node.js Codebase Analyzer and Converter
Uses LangChain for advanced prompt management and structured output
Supports Google Gemini (primary) and Anthropic Claude (fallback)
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

# LangChain imports
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.runnables import RunnablePassthrough
try:
    from langchain_community.cache import InMemoryCache
except ImportError:
    print("⚠️ langchain-community not installed. Caching will be disabled.")
    print("   Install with: pip install langchain-community")
    InMemoryCache = None
from langchain_core.globals import set_llm_cache
from langchain_google_genai import ChatGoogleGenerativeAI

# Pydantic for structured output
from pydantic import BaseModel, Field

load_dotenv()

# Enable caching to save API costs
if InMemoryCache:
    set_llm_cache(InMemoryCache())


# ============================================================================
# LLM INITIALIZATION
# ============================================================================

def initialize_llm(temperature: float = 0.3, max_tokens: int = 4000):
    """
    Initialize LLM with Google Gemini as primary and Anthropic as fallback
    Returns: (llm_instance, provider_name)
    """
    gemini_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    
    # Try Google Gemini first
    if gemini_key:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            print("✅ Using Google Gemini")
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=gemini_key,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return llm, "Gemini"
        except ImportError:
            print("⚠️  langchain-google-genai not installed. Install with: pip install langchain-google-genai")
            print("   Falling back to Anthropic...")
        except Exception as e:
            print(f"⚠️  Gemini initialization failed: {e}")
            print("   Falling back to Anthropic...")
    
    # Fallback to Anthropic Claude
    if anthropic_key:
        try:
            from langchain_anthropic import ChatAnthropic
            print("✅ Using Anthropic Claude")
            llm = ChatAnthropic(
                anthropic_api_key=anthropic_key,
                model="claude-3-sonnet-20240229",
                temperature=temperature,
                max_tokens_to_sample=max_tokens,
                max_retries=3
            )
            return llm, "Anthropic"
        except ImportError:
            print("❌ langchain-anthropic not installed. Install with: pip install langchain-anthropic")
        except Exception as e:
            print(f"❌ Anthropic initialization failed: {e}")
    
    # No valid API key found
    raise ValueError(
        "No valid API key found!\n"
        "Please set either:\n"
        "  - GOOGLE_API_KEY or GEMINI_API_KEY for Google Gemini\n"
        "  - ANTHROPIC_API_KEY for Anthropic Claude\n"
        "in your .env file or environment variables"
    )


# ============================================================================
# STRUCTURED OUTPUT MODELS (Pydantic)
# ============================================================================

class Method(BaseModel):
    """Method information with validation"""
    name: str = Field(description="Method name")
    signature: str = Field(description="Complete method signature")
    description: str = Field(description="What the method does")
    complexity: str = Field(description="Low, Medium, or High", pattern="^(Low|Medium|High)$")

class Module(BaseModel):
    """Module/Class information with validation"""
    name: str = Field(description="Module/class name")
    description: str = Field(description="Module purpose and functionality")
    methods: List[Method] = Field(description="List of methods in the module")
    dependencies: List[str] = Field(default_factory=list, description="List of dependencies")


# ============================================================================
# CODEBASE SCANNER
# ============================================================================

class CodebaseScanner:
    """Scan Java codebase and categorize files"""
    
    @staticmethod
    def scan(root_path: str) -> List[Dict[str, Any]]:
        """Recursively scan Java codebase"""
        java_files = []
        
        print(f"📂 Scanning: {root_path}")
        
        for root, dirs, files in os.walk(root_path):
            # Skip common non-source directories
            dirs[:] = [d for d in dirs if d not in ['.git', 'target', 'build', 'node_modules', '.idea']]
            
            for file in files:
                if file.endswith('.java'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
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
        """Categorize Java file based on naming and annotations"""
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
    """Analyze Java code using LangChain with structured outputs"""
    
    def __init__(self, llm, provider: str):
        self.llm = llm
        self.provider = provider
        
        # Language-aware text splitter for large files
        self.text_splitter = RecursiveCharacterTextSplitter.from_language(
            language=Language.JAVA,
            chunk_size=8000,  # ~2000 tokens
            chunk_overlap=500  # Preserve context between chunks
        )
        
        # Pydantic parser for structured output
        self.module_parser = PydanticOutputParser(pydantic_object=Module)
        
        # Setup analysis chain
        self._setup_analysis_chain()
    
    def _setup_analysis_chain(self):
        """Setup LangChain prompt and chain for analysis"""
        
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
        Analyze a Java file using LangChain with automatic validation
        Handles large files with intelligent chunking
        """
        try:
            # For large files, use chunking
            if len(file_info['content']) > 10000:
                return self._analyze_large_file(file_info)
            
            # Use Pydantic parser for structured output
            format_instructions = self.module_parser.get_format_instructions()
            
            # Invoke the chain
            response = self.analysis_chain.invoke({
                "file_name": file_info['name'],
                "file_type": file_info['type'],
                "code": file_info['content'],
                "format_instructions": format_instructions
            })
            
            # Parse with automatic validation
            module = self.module_parser.parse(response.content)
            
            # Convert to output format
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
        """Handle large files with LangChain's intelligent chunking"""
        print(f"  📄 Large file detected, using chunking...")
        
        from langchain_core.documents import Document
        
        # Create document
        doc = Document(page_content=file_info['content'], metadata={"source": file_info['name']})
        
        # Split into chunks (preserves context)
        chunks = self.text_splitter.split_documents([doc])
        print(f"  ✂️  Split into {len(chunks)} chunks")
        
        # Analyze each chunk
        all_methods = []
        all_dependencies = set()
        descriptions = []
        
        for i, chunk in enumerate(chunks[:5]):  # Limit to first 5 chunks to save tokens
            try:
                # Simplified analysis for chunks
                chunk_prompt = f"""Analyze this Java code segment:

{chunk.page_content}

Extract:
1. Method definitions (name, signature, description, complexity)
2. Import statements
3. Brief description

Return as JSON with fields: methods (array), dependencies (array), description (string)"""
                
                response = self.llm.invoke(chunk_prompt)
                
                # Parse response
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
        
        # Combine results
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
        """Generate project overview using LLM"""
        
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
            return "A Java application with layered architecture including controllers, services, and data access components."


# ============================================================================
# LANGCHAIN CODE CONVERTER
# ============================================================================

class CodeConverter:
    """Convert Java to Node.js using LangChain sequential chains"""
    
    def __init__(self, llm, provider: str):
        self.llm = llm
        self.provider = provider
        self._setup_conversion_chain()
    
    def _setup_conversion_chain(self):
        """Setup multi-step conversion chain using LCEL"""
        
        # Step 1: Analyze structure
        structure_template = """Analyze the structure of this Java {module_type}:

{java_code}

Identify:
1. Main responsibilities
2. Key methods and their purposes
3. Design patterns used
4. Dependencies

Structural analysis:"""

        structure_prompt = PromptTemplate.from_template(structure_template)
        
        # Step 2: Convert with context
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
        
        # LCEL Chain
        self.conversion_chain = (
            RunnablePassthrough.assign(
                structure=(structure_prompt | self.llm | StrOutputParser())
            )
            | conversion_prompt
            | self.llm
            | StrOutputParser()
        )
    
    def convert(self, java_code: str, module_type: str) -> str:
        """Convert Java code to Node.js using multi-step chain"""
        
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
            nodejs_code = self.conversion_chain.invoke({
                "module_type": module_type,
                "java_code": java_code,
                "framework": framework_map.get(module_type, "Node.js patterns")
            })
            
            return nodejs_code
        except Exception as e:
            print(f"  ⚠️  Conversion error: {str(e)[:100]}")
            return f"// Conversion failed for {module_type}\n// Error: {str(e)}"


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution flow"""
    
    # Configuration
    CODEBASE_PATH = os.getenv('CODEBASE_PATH', './sakila-java')
    OUTPUT_DIR = './output'
    
    # Create output directories
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/converted", exist_ok=True)
    
    print("=" * 70)
    print("🚀 Java to Node.js Converter (LangChain)")
    print("=" * 70)
    print()
    
    # Initialize LLM (Gemini primary, Anthropic fallback)
    try:
        llm, provider = initialize_llm(temperature=0.3, max_tokens=4000)
        print(f"🤖 LLM Provider: {provider}\n")
    except ValueError as e:
        print(f"❌ {e}")
        return
    
    # Step 1: Scan codebase
    scanner = CodebaseScanner()
    java_files = scanner.scan(CODEBASE_PATH)
    
    if not java_files:
        print(f"❌ No Java files found in {CODEBASE_PATH}")
        return
    
    # Step 2: Analyze files
    print("🧠 Analyzing Java files with LangChain...\n")
    analyzer = JavaAnalyzer(llm, provider)
    modules = []
    
    for i, file_info in enumerate(java_files, 1):
        print(f"  [{i}/{len(java_files)}] Analyzing {file_info['name']}...")
        module = analyzer.analyze_file(file_info)
        modules.append(module)
    
    # Step 3: Generate project overview
    print("\n📊 Generating project overview...")
    project_overview = analyzer.generate_overview(modules)
    
    # Step 4: Create structured output
    structured_output = {
        "projectOverview": project_overview,
        "modules": modules,
        "metadata": {
            "llmProvider": provider,
            "totalFiles": len(java_files),
            "totalModules": len(modules)
        }
    }
    
    output_file = f"{OUTPUT_DIR}/analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structured_output, f, indent=2)
    
    print(f"✅ Saved structured analysis to: {output_file}\n")
    
    # Step 5: Convert selected files to Node.js
    print("🔄 Converting selected files to Node.js...\n")
    
    # Re-initialize LLM for conversion with different parameters
    converter_llm, _ = initialize_llm(temperature=0.2, max_tokens=8000)
    converter = CodeConverter(converter_llm, provider)
    
    # Select all files for conversion
    modules_to_convert = modules

    converted_files = []

    for module in modules_to_convert:
        if module and module['methods']:  # Only convert if has methods
            print(f"  Converting {module['name']} ({module['type']})...")
            
            # Read original Java file
            with open(module['filePath'], 'r', encoding='utf-8') as f:
                java_code = f.read()
            
            # Convert using LangChain chain
            nodejs_code = converter.convert(java_code, module['type'])
            
            # Save converted file
            output_path = f"{OUTPUT_DIR}/converted/{module['name']}.js"
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(nodejs_code)
            
            converted_files.append({
                "original": module['name'],
                "type": module['type'],
                "outputPath": output_path
            })
            
            print(f"  ✅ Saved to: {output_path}\n")
    
    # Save conversion summary
    with open(f"{OUTPUT_DIR}/conversions.json", 'w') as f:
        json.dump({
            "llmProvider": provider,
            "conversions": converted_files
        }, f, indent=2)
    
    # Summary
    print("=" * 70)
    print("✨ Conversion Complete!")
    print("=" * 70)
    print(f"\n🤖 LLM Provider Used: {provider}")
    print(f"📁 Output Location: {OUTPUT_DIR}/")
    print(f"   - analysis.json: Structured knowledge extraction")
    print(f"   - converted/: Node.js files ({len(converted_files)} files)")
    print(f"   - conversions.json: Conversion summary")
    print(f"\n🎯 Analyzed {len(modules)} modules")
    print(f"🔄 Converted {len(converted_files)} files to Node.js")
    print()


if __name__ == "__main__":
    main()
