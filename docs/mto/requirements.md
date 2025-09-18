Made-To-Order Module

create a whole new MTO module:

add a data model manager_product_formula (activityId-specific), refer the existing product formula module

=> MTO type 1

add a data model manager_requirement_product_type_1 
1. manager product formula id
2. (decimal) purchase_gold_price
3. (int) base_purchase_number
4. (time) release time
5. (time) settlement time
6. (int) overall_purchase_number
7. (decimal) overall_purchase_budget = overall_purchase_number * purchase_gold_price
8. (int) base_count_population_number (default 1000, should > 1) 

business process: 

in release time, the user(role in students) will see the market requirements for MTO type 1 in each tile,

for each tile (tile_population),  requirement number of each tile = base_purchase_number * Int (tile_population / base_count_population_number)

if sum of all (requirement_number) > overall_purchase_number, keep deducting Max(requirement_number) (if exist equal max number, all set requirement number = 0) ’s tile ’s  into 0, and then count the new sum of all (requirement_number) until the overall_purchase_number >= requirement_number,  and create the MTO type 1 and users will see the details of MTO type 1 for this product,

before the  Settlement time, every team can deliver the products (the number must be int) into every tile ’s list, need to pay for the transporattion fee. 

(for per MTO, the team can submit one time in per tile)

to the Settlement time, the system will conduct the settlement process: 
1. count each tile ’s comming products, check if the product align with the manager_product_formule, count one by one until each tile’s requirement_number for this product fullfilled. the system pay the team ( need to integrate with existing team account module)
2. for the uncount products, the team can select team’s facility-space and pay the transportation fee to get the products back



=> MTO type 2

NOTE that the only team build the facility type MALL can participate

add a data model manager_requirement_product_type_2 
1. manager product formula id
2. (time) release time
3. (time) settlement time
4. (decimal) overall_purchase_budget

at the release time, the  user will see the MTO type 2 details,

befor the settlement time, the team with  MALL facility can submit the products to its MALL with traget MTO (need the products within the MALL facility’s space)with 
1. (int) product number 
2. (decimal) product sell price per unit

(for per MTO, the team can submit one time in per tile)

at the settlement time, 
- do a calculation for all tiles (with MALL facility in this tile) 's population ,   
- evey tile ’s budget would be  this tile’s population /  all tiles (with MALL facility) ’s population * 
overall_purchase_budget
- for each tile ’s all MALL ’s product for this MTO_type_2, order based on product sell price per unit, start from the lowest, 
- check the products’s formula align with manager product formula, if correct , count this, all deduct the budget from this tile’s all budget, and team get the gold, until the budget cannot afford 1 unit of product

after the settlement time, team can pay the transporattion fee to get the unsettled products 
to the selected facility space



