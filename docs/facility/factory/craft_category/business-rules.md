# Craft Category Business Rules

## Overview
This document defines the business rules and constraints for the craft category module used in factory production systems. All rules are designed for the business simulation educational environment targeting students aged 15-22.

## Craft Categories Overview

### Production Technology Types
Based on the CSV data, the production system includes 7 distinct craft categories, each with 4 technology levels:

1. **Mechanical Manufacturing** (机械制造)
   - Focus: Industrial machinery and equipment production
   - Characteristics: Moderate to high resource consumption
   - Yield Range: 88% - 99% (increases with technology level)

2. **Materials Processing** (材料加工)
   - Focus: Raw material transformation and refinement
   - Characteristics: Balanced resource requirements
   - Yield Range: 85% - 99%

3. **Biochemical** (生物化学)
   - Focus: Chemical and biological production processes
   - Characteristics: Lower fixed costs, higher variable costs
   - Yield Range: 70% - 97% (lowest starting yield)

4. **Electronic Equipment Processing** (电子器械)
   - Focus: Electronics and high-tech equipment manufacturing
   - Characteristics: High power consumption, lower water usage
   - Yield Range: 65% - 98% (widest improvement range)

5. **Energy Utilization** (能源利用)
   - Focus: Energy conversion and resource optimization
   - Characteristics: High power requirements, moderate other costs
   - Yield Range: 82% - 98%

6. **Cutting and Textile** (裁剪纺织)
   - Focus: Fabric processing and garment manufacturing
   - Characteristics: Lower power needs, higher water consumption
   - Yield Range: 82% - 98%

7. **Food Processing** (食品加工)
   - Focus: Food production and packaging
   - Characteristics: Lowest overall resource requirements
   - Yield Range: 80% - 98%

## Technology Levels

### Level Classifications
Each craft category has 4 distinct technology levels with progressive improvements:

1. **Level 1** - Basic Technology
   - Lowest fixed costs
   - Lowest variable cost percentages
   - Lowest yield rates

2. **Level 2** - Standard Technology
   - Moderate cost increases
   - Improved yield rates

3. **Level 3** - Advanced Technology
   - Higher costs
   - High yield rates

4. **Level 4** - Peak Technology
   - Highest fixed costs
   - Highest variable cost percentages
   - Maximum yield rates

## Core Business Rules

### 1. Cost Structure

#### Fixed Costs (Per Production Cycle)
- **Water**: Fixed amount of water units required regardless of production volume
- **Power**: Fixed amount of power units required for facility operation
- **Gold**: Fixed monetary cost for setup and maintenance

#### Variable Costs (Percentage of Production Volume)
- **Water %**: Additional water consumption based on production quantity
- **Power %**: Additional power consumption scaled with output
- **Gold %**: Additional monetary cost proportional to production volume


### 2. Yield Efficiency Rules

#### Yield Percentage
- Represents the conversion efficiency from raw materials to finished products
- Higher technology levels provide better yields

#### Technology Level Impact
- Each technology level provides significant yield improvements
- Average yield improvements by level upgrade:
  - Level 1 → Level 2: +5-17%
  - Level 2 → Level 3: +3-11%
  - Level 3 → Level 4: +1-5%

### 3. Category-Specific Rules

#### Mechanical Manufacturing
- Highest gold requirements at top levels (132 fixed + 16% variable)
- Consistent high yield potential (88-99%)
- Suitable for high-value product manufacturing

#### Materials Processing
- Balanced resource consumption across all levels
- Stable yield progression (85-99%)
- Optimal for general-purpose production

#### Biochemical
- Starts with lowest yield (70%) but reaches competitive levels (97%)
- Unique cost structure with fluctuating resource needs
- High risk-reward ratio for strategic players

#### Electronic Equipment Processing
- Extremely high power consumption (up to 240 fixed + 31.2% variable)
- Lowest water requirements
- Widest yield improvement range (65-98%)

#### Energy Utilization
- High power requirements reflect energy-intensive processes
- Moderate water and gold costs
- Consistent yield improvements (82-98%)

#### Cutting and Textile
- Lowest power requirements among all categories
- Higher water consumption for fabric processing
- Good yield rates even at low levels (82%)

#### Food Processing
- Most economical option overall
- Lowest barrier to entry
- Competitive yield rates (80-98%)

## Strategic Considerations

### 1. Technology Investment Strategy
- **Early Game**: Start with Level 1 or Level 2 technology based on capital
- **Mid Game**: Upgrade to Level 3 technology for competitive advantage
- **Late Game**: Level 4 technology for maximum efficiency and market dominance

### 2. Category Selection Factors
- **Capital Availability**: Lower categories (Food, Textile) for limited budgets
- **Resource Access**: Match category to available resources (water vs. power)
- **Product Type**: Align craft category with intended product line
- **Market Competition**: Higher technology levels for competitive markets

### 3. Efficiency Optimization
- **Break-even Analysis**: Calculate minimum production volume for profitability
- **Resource Planning**: Balance fixed vs. variable costs based on production scale
- **Yield Maximization**: Prioritize technology upgrades for high-volume production

## Implementation Guidelines

### Admin Management
- Administrators can create, update, and delete craft categories
- All 28 configurations (7 categories × 4 levels) are editable
- Changes take effect immediately for new production cycles
