This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## In Browser File System
An in browser file system built completely in JavaScript and React.js

### Functionality
- Create folders and files
- Navigate directories
- Rename and Delete files and folders
- Prevents duplicate items
- Items are saved in local storage so folders are saved even when tab/browser is closed
- Folders are always listed before files regardless of the order they were created.

### Implementation
- Every item (folder or file) is given a unique id.
- Items are stored in a map with item IDs as keys and item nodes as values.
- An item node contains information about the item.

itemNode = { <br>
  name : "name of item",  <br>
  type : "folder or file",  <br>
  children : [child1ID, child2ID, ...],  <br>
}  <br>

The html is rendered exclusively through react components. <br>
All of the components were written by me excluding the context-menu.  <br>
The context-menu was taken from this repo: https://github.com/vkbansal/react-contextmenu <br>

These components as well as the items data structure can be found in src/index.js file.  <br>

