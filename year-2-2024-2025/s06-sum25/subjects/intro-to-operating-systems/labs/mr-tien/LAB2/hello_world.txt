#!/bin/bash

### ===== Task 1: Basic Operations ===== ###
task1() {
  echo "== Task 1 =="

  # 1. Display hostname
  echo "Hello $(hostname)!"

  # 2. Ask user for age
  echo -n "Enter your age: "
  read age
  echo "Your age is: $age"

  # 3. Check even or odd
  echo -n "Enter a number to check even/odd: "
  read num
  if (( num % 2 == 0 )); then
    echo "$num is even"
  else
    echo "$num is odd"
  fi

  # 4. Find the largest of 3 numbers
  echo -n "Enter three integers (a b c): "
  read a b c
  max=$a
  (( b > max )) && max=$b
  (( c > max )) && max=$c
  echo "The largest number is: $max"

  # 5. Special multiplication logic
  echo -n "Enter two positive integers (a b): "
  read x y
  if (( x < 0 || y < 0 )); then
    echo "Error: a or b is negative!"
  else
    if (( y % 2 == 1 )); then
      result=$(( x * (y - 1) + x ))
    else
      result=$(( x * 2 * (y / 2) ))
    fi
    echo "Special multiplication result: $result"
  fi
}

### ===== Task 2: Mathematical Functions ===== ###
factorial() {
  n=$1; fact=1
  for (( i=2; i<=n; i++ )); do
    fact=$((fact * i))
  done
  echo "Factorial of $n is: $fact"
}

simple_leap_year() {
  year=$1
  (( year % 4 == 0 )) && echo "$year is a leap year" || echo "$year is not a leap year"
}

full_leap_year() {
  year=$1
  if (( year % 4 == 0 )); then
    if (( year % 100 == 0 )); then
      (( year % 400 == 0 )) && echo "$year is a leap year" || echo "$year is not a leap year"
    else
      echo "$year is a leap year"
    fi
  else
    echo "$year is not a leap year"
  fi
}

multiplication_table() {
  n=$1
  for (( i=1; i<=10; i++ )); do
    echo "$n x $i = $((n * i))"
  done
}

task2() {
  echo "== Task 2 =="
  echo -n "Enter number for factorial: "
  read f; factorial $f
  echo -n "Enter year (simple check): "
  read y1; simple_leap_year $y1
  echo -n "Enter year (full check): "
  read y2; full_leap_year $y2
  echo -n "Enter number for multiplication table: "
  read m; multiplication_table $m
}

### ===== Task 3: Array Manipulation ===== ###
task3() {
  echo "== Task 3 =="

  # Read array from user
  echo -n "Enter array elements (space-separated): "
  read -a arr
  echo "Array: ${arr[*]}"

  # Sum of odd numbers
  sum=0
  for n in "${arr[@]}"; do (( n % 2 == 1 )) && ((sum += n)); done
  echo "Sum of odd numbers: $sum"

  # Product of odd numbers
  prod=1
  for n in "${arr[@]}"; do (( n % 2 == 1 )) && ((prod *= n)); done
  echo "Product of odd numbers: $prod"

  # Count primes
  count=0
  for n in "${arr[@]}"; do
    if (( n > 1 )); then
      for (( i=2; i*i<=n; i++ )); do
        (( n % i == 0 )) && prime=0 && break || prime=1
      done
      (( prime )) && ((count++))
    fi
  done
  echo "Prime count: $count"

  # Occurrences of x
  echo -n "Enter number to count: "
  read x; c=0
  for n in "${arr[@]}"; do (( n == x )) && ((c++)); done
  echo "$x occurs $c times"

  # Check sorted ascending
  sorted=1
  for (( i=0; i<${#arr[@]}-1; i++ )); do
    (( arr[i] > arr[i+1] )) && sorted=0 && break
  done
  echo $([[ $sorted -eq 1 ]] && echo "Array is sorted" || echo "Not sorted")

  # Sort descending
  desc=($(printf "%s\n" "${arr[@]}" | sort -nr))
  echo "Sorted descending: ${desc[*]}"

  # Remove duplicates
  declare -A seen; unique=()
  for n in "${arr[@]}"; do
    [[ -z ${seen[$n]} ]] && unique+=($n) && seen[$n]=1
  done
  echo "Array without duplicates: ${unique[*]}"

  # Replace y with z
  echo -n "Enter y and z to replace: "
  read y z; new=()
  for n in "${arr[@]}"; do
    (( n == y )) && new+=($z) || new+=($n)
  done
  echo "After replacing $y with $z: ${new[*]}"
}

### ===== Task 4: String Manipulation ===== ###
task4() {
  echo "== Task 4 =="
  echo -n "Enter string: "
  read mystr

  while true; do
    echo -e "\n1) Remove shortest match from start"
    echo "2) Remove longest match from start"
    echo "3) Remove shortest match from end"
    echo "4) Remove longest match from end"
    echo "5) Extract from offset x to end"
    echo "6) Extract n chars from offset x"
    echo "0) Back"
    read -p "Choose: " opt

    case $opt in
      1) echo "Result: ${mystr#"$pat"}";;
      2) echo "Result: ${mystr##"$pat"}";;
      3) echo "Result: ${mystr%"$pat"}";;
      4) echo "Result: ${mystr%%"$pat"}";;
      5) echo -n "Offset x: "; read x; echo "Result: ${mystr:$x}";;
      6) echo -n "Offset x: "; read x; echo -n "Length n: "; read n; echo "Result: ${mystr:$x:$n}";;
      0) break;;
      *) echo "Invalid";;
    esac
  done
}

### ===== Main Menu ===== ###
while true; do
  echo -e "\nMAIN MENU:"
  echo "1) Task 1"
  echo "2) Task 2"
  echo "3) Task 3"
  echo "4) Task 4"
  echo "0) Exit"
  read -p "Choose: " choice

  case $choice in
    1) task1;;
    2) task2;;
    3) task3;;
    4) task4;;
    0) exit;;
    *) echo "Invalid";;
  esac
done

