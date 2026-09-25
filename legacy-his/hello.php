<?php
// Variables start with $
$name = "Hafizul";
$age = 26;

// Double quotes insert variables (like `${}` in JS)
echo "Hello, $name! You are $age.\n";

// Arrays: a list of "associative arrays" (like JS objects)
$patients = [
    ['name' => 'Ahmad', 'age' => 8],
    ['name' => 'Siti', 'age' => 35],
    ['name' => 'Tan', 'age' => 62],
];

// A function with types (like TypeScript)
function getFee(int $age): int
{
    if ($age < 12) return 25;
    if ($age >= 60) return 20;
    return 35;
}

// Loop (like for...of)
foreach ($patients as $p) {
    echo "{$p['name']} - RM" . getFee($p['age']) . "\n";   // . joins text
}

// Turn data into JSON: exactly what an API sends
echo json_encode($patients, JSON_PRETTY_PRINT) . "\n";