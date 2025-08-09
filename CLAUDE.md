
# Rules that must be followed for any project (Extremely Important!!!)

## Communication
- Always use english for thinking and dialogue, if the request with other language, translate into english to understand.

## Documentation
- When writing .md documents, use english
- Write formal documentation to the project's docs/ directory
- Write plans, proposals and other documents for discussion and review to the project's discuss/ directory

## Code Architecture
- Hard requirements for writing code, including the following principles:
  (1) For dynamic languages like TypeScript, ensure each code file does not exceed 300 lines as much as possible
  (2) Files in each folder layer should not exceed 8 files as much as possible. If exceeded, plan for multi-layer subfolders

- In addition to hard requirements, always pay attention to elegant architectural design and avoid the following "code smells" that may erode our code quality:
  (1) Rigidity: The system is difficult to change; any minor modification triggers a chain reaction of cascading changes.
  (2) Redundancy: The same code logic appears repeatedly in multiple places, making maintenance difficult and prone to inconsistency.
  (3) Circular Dependency: Two or more modules are entangled with each other, forming an inseparable "deadlock" that makes testing and reuse difficult.
  (4) Fragility: Changes to one part of the code cause unexpected breakage in other seemingly unrelated parts of the system.
  (5) Obscurity: Code intent is unclear and structure is chaotic, making it difficult for readers to understand its functionality and design.
  (6) Data Clump: Multiple data items always appear together in parameters of different methods, suggesting they should be combined into an independent object.
  (7) Needless Complexity: Using a "sledgehammer to crack a nut," over-engineering makes the system bloated and difficult to understand.

- **Very Important!!** Whether you are writing code yourself or reading/reviewing others' code, strictly follow the above hard requirements and always pay attention to elegant architectural design.
- **Very Important!!** Whenever you identify those "code smells" that may erode our code quality, immediately ask the user if optimization is needed and provide reasonable optimization suggestions.

## Run & Debug
- Must first maintain all .sh scripts needed for Run & Debug in the project's scripts/ directory
- For all Run & Debug operations, exclusively use .sh scripts in the scripts/ directory for start/stop. Never directly use commands like npm, pnpm, uv, python, etc.
- If .sh script execution fails, whether it's a problem with the .sh script itself or other code issues, fix it urgently first. Then still insist on using .sh scripts for start/stop
- Before Run & Debug, configure Logger with File Output for all projects and uniformly output to the logs/ directory

## React / Next.js / TypeScript / JavaScript
- Next.js mandatory use v15.4, don't use v15.3 or v14 or lower versions
- React mandatory use v19, don't use v18 or lower versions  
- Tailwind CSS mandatory use Tailwind CSS v4. Don't use v3 or lower versions
- Strictly prohibited to use commonjs module system
- Use TypeScript as much as possible. Only use JavaScript when build tools completely don't support TypeScript
- Define all data structures as strongly typed as much as possible. If any or unstructured json must be used in individual scenarios, stop and seek user consent first