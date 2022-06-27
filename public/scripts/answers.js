/* eslint-disable no-undef */

$(document).ready(function() {
  const currentURL = window.location.href;
  const pollID = currentURL.split('/')[currentURL.split('/').length - 1];
  $.ajax({
    method: "GET",
    url: `/getoptions/${pollID}`,
    success: (data) => {
      data.forEach((option) => {
        addOptionElement(option);
      });
      $('#user-answers').sortable();
    }
  });


  $("#confirm-btn").on('click', () => {

    const answers = [];

    document.querySelectorAll('.option').forEach((el) => {
      const optionId = el.getAttribute('optionID');
      answers.push(optionId);
    });

    // TODO: send array via ajax to POST answer

  });

  $("#confirm-btn").on('click', () => {

    window.location.href = 'http://localhost:8080/submit';

  });



});

const addOptionElement = (option) => {
  const inputHTML = `
  <li class="option" optionID="${option.id}">
  <div class="option-title">
    ${option.title}
  </div>
    <div class="option-description"> ${option.description}</div>
  </li>`;

  $('#user-answers').append(inputHTML);


};

