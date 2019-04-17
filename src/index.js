import React from 'react';
import ReactDOM from 'react-dom';
import '../src/index.css';

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";


//the item (folder and files) information of all items in file system is stored in a tree,
// where data is always pointing to the node of the current directory


class ItemNode  {
    constructor(path, type, children) {
        this.name = path;
        this.type = type;
        this.children = children;
    }

}

class ItemTree {
    constructor() {
        let root = new ItemNode('root','Folder', []);
        this.allItems = {'rootFolder' : root};
    }

    loadTree(allItems) {
        this.allItems = allItems;
    }

    addItem(path, type) {
        let parent = path.substring(0, path.lastIndexOf('/'));
        let children = this.allItems[parent+'Folder'].children;
        if(children.indexOf(path+type) <= -1) {
            children.push(path+type);

            let newItem = new ItemNode(path, type, []);
            this.allItems[path+type] = newItem;


            return this._getAllChildNodes(children);

        } else {
            return null;
        }

    }

    getDirectoryChildren(path) {
        return this._getAllChildNodes(this.allItems[path+'Folder'].children);
    }


    deleteItem(path, type) {
        //remove from all items
        delete this.allItems[path+type];
        //--------------------------delete all decendents of file aswell

        //remove from parents children
        console.log(path);
        let parent = path.substring(0, path.lastIndexOf('/'));
        let children = this.allItems[parent+type].children;
        let childIndex = children.indexOf(path+type);
        children.splice(childIndex, 1);
        return this._getAllChildNodes(children);
    }

    renameItem(path, newPath, type) {
        let parent = path.substring(0, path.lastIndexOf('/'));
        let children = this.allItems[parent+'Folder'].children;

        //if not already in child
        if(children.indexOf(newPath+type) <= -1) {
            let childIndex = children.indexOf(path+type);
            children[childIndex]= newPath + type;

            let id = newPath + type;
            //rename key
            this.allItems[id] = this.allItems[path+type];
            this.allItems[id].name = newPath;
            delete this.allItems[path];

            return this._getAllChildNodes(children);

        } else {
            return null;
        }

    }

    _getAllChildNodes(ids) {
        return ids.map(id => {return this.allItems[id]});
    }

}

//localStorage.clear(); //uncomment to clear localstorage
let data;
//if data not set make new root directory else load root directory
if (localStorage.getItem('Data') === null) {
    //item node of current directory
    data = new ItemTree();
} else {
    data = new ItemTree();
    let allItems = JSON.parse(localStorage.getItem("Data"));
    data.loadTree(allItems);
}


// Renders the add folder/file buttons, the back button, and dynamically renders
// the current directory to be displayed
class FileManager extends React.Component {
    //initialize current directory to root with no children
    constructor(props) {
        super(props);
        //state always updated to reflect current directory to display
        this.state = {
            children: data.getDirectoryChildren('root').concat(),
            path: 'root',

        };

        this.handleAddItem = this.handleAddItem.bind(this);
        this.renderFolders = this.renderFolders.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleParentClick = this.handleParentClick.bind(this);
        this.handleItemDelete = this.handleItemDelete.bind(this);
        this.handleRename = this.handleRename.bind(this);
    }

    //add new item to data, update state to display new item
    handleAddItem(name, type) {
        let path = this.state.path + '/' + name;
        let children = data.addItem(path, type, []);
        if (children) {
            this.setState({
                children: children.concat()
            });
        } else {
            alert("A " + type + " with this name already exists!");
        }
    }

    //if folder is clicked update state to display new directory
    handleItemClick(path, type) {
        if(type === 'Folder') {
            console.log(path);
            let children = data.getDirectoryChildren(path).concat();

            this.setState({
                children: children,
                path: path,
            });
        } else {
            //if file clicked type do stuff here
        }
    }

    //if the back button is pressed, update state to display parent directory
    handleParentClick() {
        if (this.state.path !== 'root') {
            let parentPath = this.state.path.slice();
            parentPath = parentPath.substring(0, parentPath.lastIndexOf('/'));

            let children = data.getDirectoryChildren(parentPath);

            this.setState({
                children: children.concat(),
                path: parentPath,
            });
        }

    }


    //delete the passed item from data, update state to display deletion
    handleItemDelete(path, type) {
        let children = data.deleteItem(path, type);
        this.setState({children: children.concat()});
    }

    //find file in data and rename it, update state
    handleRename(path, newName, type) {
        let newPath = this.state.path + '/' + newName;
        let children = data.renameItem(path, newPath, type);
        if(children) {this.setState({children: children.concat()});
        } else {
            alert("A " + type + " with this name already exists");
        }
    }

    //using the children current state render the file components
    renderFolders() {
        localStorage.setItem('Data',JSON.stringify(data.allItems));
        let items = this.state.children.concat();
        items.sort((a,b) => a.type < b.type);
        return items.map((item) => <Item type={item.type} key={item.name + item.type} name={item.name}
                                                        onClick ={this.handleItemClick}
                                                        onDeleteClick ={this.handleItemDelete} onRenameClick={this.handleRename}/>);

    }

    render() {
        return (
            <div>
                <div>
                    <AddItemButton type="Folder" onClick={this.handleAddItem}/>
                    <AddItemButton type="File" onClick={this.handleAddItem}/>
                    <ParentFolderButton onClick={() => this.handleParentClick()}/>
                </div>

                <div>
                    <h3>{this.state.path}</h3>
                </div>
                <div>
                    {this.renderFolders()}
                </div>
            </div>
        );
    }
}


//An item component displays a single clickable item (folder or file)
class Item extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            renaming: false,
            name: this.props.name,
            type: this.props.type,
        };
        this.handleMenuRename = this.handleMenuRename.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleRename = this.handleRename.bind(this);

    }

    //if file is right clicked allow the NameItemModal to be displayed
    handleMenuRename() {
        this.setState({renaming: true});
    }

    //if NameItemModal is closed, stop displaying it
    handleCloseModal() {
        this.setState({renaming: false});
    }

    //calls method in FileManager to change the state of children
    handleRename(newName) {
        this.props.onRenameClick(this.state.name, newName, this.state.type);
    }

    render() {
        let srcImage;
        if(this.props.type === 'Folder') {
            srcImage = "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/folder-blue-128.png";
        } else {
            srcImage = "https://static.thenounproject.com/png/47347-200.png";
        }

        return (
            <div>
                <ContextMenuTrigger id={this.state.name + this.state.type}>
                    <div className='files' onClick={() => this.props.onClick(this.state.name, this.state.type)}>
                        <p>
                        <img src={srcImage} alt={this.state.type + " Icon"}/>
                        {this.props.name}</p>
                    </div>
                </ContextMenuTrigger>

                <ContextMenu id={this.state.name + this.state.type}>
                    <MenuItem onClick={this.handleMenuRename}>
                        Rename
                    </MenuItem>
                    <MenuItem onClick={() => this.props.onDeleteClick(this.state.name, this.state.type)}>
                        Delete
                    </MenuItem>
                </ContextMenu>

                {this.state.renaming ? <NameItemModal onClick= {this.handleRename}
                                                      closeModal = {this.handleCloseModal}
                                                      submitName = {"Rename " + this.state.type}/> : null}
            </div>
        );
    }
}


//AddItemButton is a single button that is used to open the NameItemModal
class AddItemButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayModal: false
        };
        this.onClick = this.onClick.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    //when add item button clicked name file modal is displayed
    onClick() {
        this.setState({displayModal: true});
    }

    handleCloseModal() {
        this.setState({displayModal: false});
    }

    render() {
        let type = this.props.type;

        return (
            <div className='menuButtonsCont'>
                <button id="addFolderButton" onClick={this.onClick}>
                    Add {type}
                </button>
                {this.state.displayModal ? <NameItemModal type={this.props.type} closeModal={this.handleCloseModal}
                                                          onClick={this.props.onClick} submitName ={"Add " + type}/>: null}
            </div>
        );

    }
}


//NameItemModal allows user to enter a file name into a text box and submit
//used for adding new items and renaming current ones
class NameItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submitValue: "",
        };
        this.handleSpanClick = this.handleSpanClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSpanClick() {
        this.props.closeModal();
    }

    handleSubmit(e) {
        this.handleSpanClick();
        this.props.onClick(this.state.submitValue, this.props.type);
        e.preventDefault();
    }

    handleChange(e) {
        this.setState({submitValue: e.target.value})
    }

    render() {
        let modal = (
            <div id="myModal" className="modal">
                <div className="modal-content">
                    <span className="close" onClick={this.handleSpanClick}>&times;</span>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            {this.props.type} Name:
                            <input type="text" value={this.state.submitValue} onChange={this.handleChange} />
                        </label>
                        <input className="submitButton" type="submit" value={this.props.submitName} />
                    </form>
                </div>
            </div>
        );
        const modalRoot = document.getElementById('last');
        return ReactDOM.createPortal(modal, modalRoot);
    }
}

//A single button used to display the parent directory
class ParentFolderButton extends React.Component {
    render() {
        return (
            <div className='menuButtonsCont'>
            <button id="backButton" onClick={() => this.props.onClick()}>
                Go Back
            </button>
            </div>

        );

    }
}

ReactDOM.render(<FileManager/>, document.getElementById('app'));
