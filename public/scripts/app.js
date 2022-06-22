/* eslint-disable no-undef */
// Client facing scripts here

//Error messages for missing user info on create_button: email, title, option, etc..

const handleDelete = (btn) => {
  btn.parentNode.remove();
};


const createEmptyOption = () => {
  // It is generally not good practice to inject plain text html into the dom for security reasons, but since this will be a static string, it's ok for now.
  const inputHTML = `<li class="option-wrapper">
  <input class="option-title-input" placeholder="option title">
  <input class="option-description-input" placeholder="description">

  <button onclick="handleDelete(this)" class="delete-btn">Delete</button>
  </li>`;

  $('#options-container').append(inputHTML);
};

//Delete option function
$(document).ready(function() {
  $('#add_button').on('click', function() {
    createEmptyOption();
  });
});




