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
        return [];
    }
}

function saveInvitee(invitee) {
    const invitees = getInvitees();
    if (invitees.indexOf(invitee) > -1) {
        alert(`${invitee} is already an invitee`);
        return false;
    } 
    invitees.push(invitee);
    localStorage.setItem('invitees', JSON.stringify(invitees));
    return true;
}

function removeInvitee(invitee) {
    const invitees = getInvitees();
    const index = invitees.indexOf(invitee);
    invitees.splice(index, 1);
    localStorage.setItem('invitees', JSON.stringify(invitees));
}

function createLi(text) {
    function createElement(elementName, property, value) {
        const element = document.createElement(elementName);
        element[property] = value;
        return element;
    }

    function appendToLi(elementName, property, value) {
        const element = createElement(elementName, property, value);
        li.appendChild(element);
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
    appendToLi('span', 'textContent', text);
    appendToLi('label', 'textContent', 'Confirm')
    .appendChild(createOptions('select', ['className', 'name'], ['status', 'options']));
    appendToLi('h4', 'textContent', 'Comments: ')
    .appendChild(createElement('textarea', 'className', 'comments'));
    appendToLi('button', 'textContent', 'edit');
    appendToLi('button', 'textContent', 'remove');
    return li;
}

// load all invitees stored in local storage
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
        const li = createLi(text);
        ul.appendChild(li);
    }
    }
});

ul.addEventListener('change', (e) => {
    if (e.target.tagName === 'SELECT'){ // e.target.tagName of 'INPUT' can also be fired inside the ul when editing the invitee. This avoids a TypeError when getting the option
        const selection = e.target;
        const option = selection.options[selection.selectedIndex].value; // get the value of the option chosen
        const label = selection.parentNode;
        const listItem = label.parentNode;

        if (option !== 'unknown') {
            label.firstChild.nodeValue = 'Confirmed'; // using childNodes[0] would be the same
            listItem.className = 'responded';
        } else {
            label.childNodes[0].nodeValue = 'Confirm'; // using firstChild (not firstElementChild) would be the same
            listItem.className = '';
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
                input.type = 'text';
                input.value = span.textContent;
                removeInvitee(input.value);
                li.insertBefore(input, span);
                li.removeChild(span);
                button.textContent = 'save';
            },
            save: () => {
                const input = li.querySelector('input'); // const input = li.firstElementChild;
                const span = document.createElement('span');
                span.textContent = input.value;
                if (saveInvitee(span.textContent)){
                    li.insertBefore(span, input);
                    li.removeChild(input);
                    button.textContent = 'edit';
                }
            }
    };

        // select and run action in button's name  
        nameActions[action]();
    }
});