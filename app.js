const form = document.getElementById('registrar');
const input = form.querySelector('input');
const mainDiv = document.querySelector('.main');
const ul = document.getElementById('invitedList');

const div = document.createElement('div');
const filterLabel = document.createElement('label');
const filterCheckbox = document.createElement('input');

filterLabel.textContent = "Hide those who haven't responded";
filterCheckbox.type = 'checkbox';
div.appendChild(filterLabel);
div.appendChild(filterCheckbox);

mainDiv.insertBefore(div, ul);

filterCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if (isChecked) {
        for (let i = 0; i < lis.length; i += 1) {
            let li = lis[i];
            if (li.className === 'responded') {
                li.querySelector('.status').style.display = 'none';
                li.style.display = ''; //this will allow to pick up its previous style
            } else {
                li.style.display = 'none';
            }
        }
    } else {
        for (let i = 0; i < lis.length; i += 1) {
            let li = lis[i];
            li.style.display = '';
            li.querySelector('.status').style.display = '';
        }
    }
});

function getInvitees() {
    const invitees = localStorage.getItem('invitees');
    if (invitees) {
        return JSON.parse(invitees);
    } else {
        return []; // Initializes array
    }
}

function saveInvitee(name, index = -1) { // Index to save in exact position as where the invitee was edited, otherwise add to the end of the array
    const invitees = getInvitees();
    const i = invitees.findIndex(x => x.name === name);
    if (i > -1 && i !== index) { // Iterate over each object's name property in the array. if name is found other than current one (meaning, not -1), reject invitee other.
        alert(`${name} is already an invitee`);
        return false;
    }
    if (index < 0) {
        // Add object to the array with default properties and values.
        invitees.push({name: name, status: 'Confirm', option: 'unknown', comments: ''});
    } else {
        // Use splice to insert at given index without deleting an element. 
        // Add object to the array with existing properties and values.
        invitees.splice(index, 1, {name: name, status: invitees[index].status, option: invitees[index].option, comments: invitees[index].comments}); 
    }
    localStorage.setItem('invitees', JSON.stringify(invitees));
    return true;
}

function editProperties(index, property, value) {
    const invitees = getInvitees();
    invitees[index][property] = value;
    localStorage.setItem('invitees', JSON.stringify(invitees));
}

function removeInvitee(invitee) {
    const invitees = getInvitees();
    const index = invitees.findIndex(x => x.name === invitee);
    invitees.splice(index, 1);
    localStorage.setItem('invitees', JSON.stringify(invitees));
}

function createLi(invitee) {
    function createElement(elementName, property, value) {
        const element = document.createElement(elementName);
        element[property] = value;
        return element;
    }

    function appendToLi(elementName, property, value) {
        const element = createElement(elementName, property, value);
        li.appendChild(element);
        if (value === 'Confirmed'){
            li.className = 'responded';
        }
        return element;
    }

    function createOptions(elementName, properties, values) {
        const option_values = ['unknown', 'yes', 'no', 'maybe'];
        const options = ['I am...', 'coming!!!', 'not coming :(', 'maybe coming?'];
        const element = document.createElement(elementName);
        for (let i = 0; i < properties.length; i += 1){
            element[properties[i]] = values[i];
        }
        for (let i = 0; i < option_values.length; i += 1){
            let option = document.createElement('option');
            option.value = option_values[i];
            option.text = options[i];
            element.appendChild(option);
        }
        return element;
    }
  
    const li = document.createElement('li');
    appendToLi('span', 'textContent', invitee.name);
    if (invitee.status) {
        appendToLi('label', 'textContent', invitee.status)
        .appendChild(createOptions('select', ['className', 'name'], ['status', 'options']));
    } else {
        appendToLi('label', 'textContent', 'Confirm')
        .appendChild(createOptions('select', ['className', 'name'], ['status', 'options']));
    }
    appendToLi('h4', 'textContent', 'Comments: ')
    .appendChild(createElement('textarea', 'className', 'comments'));
    appendToLi('button', 'textContent', 'edit');
    appendToLi('button', 'textContent', 'remove');
    li.querySelector('select').value = invitee.option; // Load saved rsvp option status.
    li.querySelector('textarea').value = invitee.comments; // Load saved comments.
    return li;
}


let index = -1;
let removedName;
// Load all invitees stored in local storage when page loads.
const invitees = getInvitees();
invitees.forEach(invitee => {
    const li = createLi(invitee);
    ul.appendChild(li);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = '';
    if (text === '') {
        alert('The field cannot be empty');
    } else {
    if (saveInvitee(text)){
        const invitees = getInvitees();
        const index = invitees.findIndex(x => x.name === text);
        const invitee = invitees[index];
        const li = createLi(invitee);
        ul.appendChild(li);
    }
    }
});

ul.addEventListener('change', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT'){
        const selection = e.target;
        const label = selection.parentNode;
        const listItem = label.parentNode;
        const span = listItem.querySelector('span');
        const invitees = getInvitees();
        let index;
        if (span !== null) {
            index = invitees.findIndex(x => x.name === span.textContent);
        } else {
            index = invitees.findIndex(x => x.name === removedName);
        }
        if (selection.tagName === 'SELECT'){ // e.target.tagName of 'INPUT' can also be fired inside the ul when editing the invitee. This avoids a TypeError when getting the option
            const option = selection.options[selection.selectedIndex].value; // Get the value of the option chosen.
            if (option !== 'unknown') {
                label.firstChild.nodeValue = 'Confirmed'; // Using childNodes[0] would be the same.
                listItem.className = 'responded';
                editProperties(index, 'status', 'Confirmed');
            } else {
                label.childNodes[0].nodeValue = 'Confirm'; // Using firstChild (not firstElementChild) would be the same.
                listItem.className = '';
                editProperties(index, 'status', 'Confirm');
            }
            editProperties(index, 'option', option);
        }
        if (selection.tagName === 'TEXTAREA') {
            editProperties(index, 'comments', selection.value);
        }
    }
});

ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const button = e.target;
        const li = e.target.parentNode;
        const ul = li.parentNode;
        const action = button.textContent;
        const nameActions = {
            remove: () => {
                ul.removeChild(li);
                removeInvitee(li.firstElementChild.textContent);
            },
            edit: () => {
                const span = li.firstElementChild;
                const input = document.createElement('input');
                const invitees = getInvitees();
                index = invitees.findIndex(x => x.name === span.textContent);
                input.type = 'text';
                input.value = span.textContent;
                removedName = input.value;
                li.insertBefore(input, span);
                li.removeChild(span);
                button.textContent = 'save';
            },
            save: () => {
                const input = li.querySelector('input'); // const input = li.firstElementChild;
                const span = document.createElement('span');
                span.textContent = input.value;
                if (saveInvitee(span.textContent, index)){ // Check if edited name doesn't exist already and save it to the local storage array.
                    li.insertBefore(span, input);
                    li.removeChild(input);
                    button.textContent = 'edit';
                }
            }
        };

        // Select and run action in button's name  
        nameActions[action]();
    }
});
