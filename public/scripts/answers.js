// const dbParams = require("../../lib/db");

$(document).ready(function() {
  const currentURL = window.location.href;
  const pollID = currentURL.split('/')[currentURL.split('/').length - 1];
  // alert(pollID);
  $.ajax({
    method: "GET",
    url: `/getoptions/${pollID}`,
    success: (data) => {
      data.forEach((option) => {
        addOptionElement(option)
      });

    }
  });
});

const addOptionElement = (option) => {
  console.log(option);

  const inputHTML = `
  <div id="option-title" draggable="true">${option.title}
  <div id="option-description" draggable="true"> ${option.description}</div>

  </div>`;

  $('#user-answers').append(inputHTML);
};

