/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// Client facing scripts here


const validateEmail = (email) => {
  const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return res.test(String(email).toLowerCase());
};


// We define this handleDelete function at a global scope, when the page loads, it will have this function available on the entire page, this is for the delete option button onClick handler (in inputHTML const in createEmptyOption)
const handleDelete = (btn) => {
  // we pass a reference to the button component in the parameters, we then access it's parent element, which is the li element, and call a remove() on it to remove it from the DOM
  btn.parentNode.remove();
  const liLength = $('#options-container li').length;
  if (liLength < 2) {
    disableCreateBtn();
  } else {
    enableCreateBtn();
  }
};



// Function to inject an empty option element into the dom, under a specific parent container. an empty option element is described in the large html plain text string
const createEmptyOption = () => {
  // It is generally not good practice to inject plain text html into the dom for security reasons, but since this will be a static string, it's ok for now.
  const inputHTML = `<li class="option-wrapper">
  <input class="option-title-input" placeholder="option title">
  <input class="option-description-input" placeholder="description">

  <button onclick="handleDelete(this)" class="delete-btn">Delete</button>
  </li>`;

  // inputHTML has been written above, we want to inject it into a specific location in our DOM, this will do that
  $('#options-container').append(inputHTML);
};



const disableCreateBtn = () => {
  $('#create_button').css('opacity', '0.5');
  $('#create_button').css('pointer-events', 'none');
};

const enableCreateBtn = () => {
  $('#create_button').css('opacity', '1');
  $('#create_button').css('pointer-events', 'all');
};

const validateForm = () => {
  const email = $('#email-text').val();
  const title = $('#title-text').val();
  const optionChildren = $('#options-container').children();

  console.log($(optionChildren).children());
  let isValidInput = true;

  for (let i = 0; i < optionChildren.length; i++) {
    const element = optionChildren[i];
    const listChildren = $(element).children();
    const inputValue = $(listChildren[0]).val();
    if (!inputValue) {
      isValidInput = false;
    }
  }

  if (!validateEmail(email)) {
    $('.alert-user').css('display', 'inline');
  } else {
    $('.alert-user').css('display', 'none');
  }

  //add if condition for null description => if desc = null push only title and options


  const isInvalid = !email || !title || !isValidInput;
  if (isInvalid) {
    disableCreateBtn();
  } else {
    enableCreateBtn();
  }
};

const submitPoll = () => {
  // get the text values of the email and title input elements
  const email = $('#email-text').val();
  const title = $('#title-text').val();
  const error = $('.alert-user');

  if (!validateEmail(email)) {
    $(error).show();
    // $(error).text("Enter a valid email!");
    return false;
    // return alert('invalid email');
  }

  // start an empty options array which we will populate in the following code, we want to gather all the options information to be sent in the create poll request later
  let options = [];

  // select all elements with the option-wrapper class name, and loop through each one
  document.querySelectorAll('.option-wrapper').forEach((option) => {
    // create an empty object to store the options information
    const optionData = {};

    // get the options title input value
    const titleText = option.querySelector('.option-title-input').value;
    // get the options description input value
    const descriptionText = option.querySelector('.option-description-input').value;

    // store the input values into the empty object, and if description doesn't exist, set it to null
    optionData.title = titleText;
    optionData.description = descriptionText || null;
    console.log(optionData);

    // push the optionData we created above into the options array, this will happen on every loop of the options
    options.push(optionData);
  });


  // prepare the data object to be sent with the create poll request endpoint, we know the data format here because we can check the backend and what it's expecting in terms of format
  const data = {
    email,
    title,
    options
  };

  // make the post request to the poll create endpoint via ajax, sending the data object with all the new poll data to be used on the backend (storing it in postgres)
  $.ajax({
    method: "POST",
    url: "/poll/create",
    data: data,
    success: (data) => {
      window.location = `http://localhost:8080/success/${data.pollID}`;
    }
  });
};


// When the page has rendered, we initialize listeners to track clicks on specific buttons (add option, create poll)
$(document).ready(function() {

  // add option button listener
  $('#add_button').on('click', function() {
    //call the createEmptyOption function every time we click the add button
    createEmptyOption();
  });

  // create poll button listener
  $('#create-btn').on('click', function() {
    // Call the submit poll function every time we click the create button
    submitPoll();
  });

  $('#email-text').on('keyup', function() {
    validateForm();
  });

  $('#title-text').on('keyup', function() {
    validateForm();
  });

  $('#options-container').on('keyup', function() {
    validateForm();
  });

  $('#emailInput').on('keyup', function() {
    validateForm();
  });


  // We want to add 2 empty options when the page starts, because it doesn't really make sense to have no options available on page load (UX)
  createEmptyOption();
  createEmptyOption();
  disableCreateBtn();

});




