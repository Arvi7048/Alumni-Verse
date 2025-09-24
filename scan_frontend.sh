# Run from project root
rg -n "localhost:5000" frontend || grep -RIn "localhost:5000" frontend
rg -n "localhost:5000/api" frontend || grep -RIn "localhost:5000/api" frontend
