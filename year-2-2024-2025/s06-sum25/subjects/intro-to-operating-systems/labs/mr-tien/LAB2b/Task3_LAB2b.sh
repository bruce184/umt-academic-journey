#!/bin/bash

### ===== Task 3 ===== ###
# --- Functions --------------------------------------------------

rename_file() {
  # $1 = old name, $2 = new name
  mv "$1" "$2" && echo "Renamed '$1' to '$2'" || echo "Failed to rename '$1'"
}

delete_file() {
  # $1 = filename
  rm "$1" && echo "Deleted '$1'" || echo "Failed to delete '$1'"
}

move_file() {
  # $1 = filename, $2 = target directory
  mv "$1" "$2" && echo "Moved '$1' to '$2'" || echo "Failed to move '$1'"
}

display_file() {
  # $1 = filename
  cat "$1"
}

append_to_file() {
  # $1 = filename, variable 'text'
  read -p "Enter text to append: " text
  echo "$text" >> "$1" && echo "Appended to '$1'" || echo "Failed to append"
}

# --- Main menu loop --------------------------------------------

while true; do
  echo
  echo "File Manager Menu:"
  echo " 1) Rename a file"
  echo " 2) Delete a file"
  echo " 3) Move a file to another directory"
  echo " 4) Display file content"
  echo " 5) Append content to a file"
  echo " 0) Exit"
  read -p "Select an option: " choice

  case $choice in
    1)
      read -p "Old filename: " old
      read -p "New filename: " new
      rename_file "$old" "$new"
      ;; # required to end this command 
    2)
      read -p "Filename to delete: " file
      delete_file "$file"
      ;;
    3)
      read -p "Filename to move: " file
      read -p "Target directory: " dir
      move_file "$file" "$dir"
      ;;
    4)
      read -p "Filename to display: " file
      display_file "$file"
      ;;
    5)
      read -p "Filename to append to: " file
      append_to_file "$file"
      ;;
    0)
      echo "Goodbye!"
      exit 0
      ;;
    *)
      echo "Invalid choice. Please enter 0–5."
      ;;
  esac # required to end the 'case' block  
  
done # required to end the 'while' block 