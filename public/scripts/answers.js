/* eslint-disable no-undef */
$(document).ready(function() {
  const currentURL = window.location.href;
  const pollID = currentURL.split('/')[currentURL.split('/').length - 1];
  $.ajax({
    method: "GET",
    url: `/getoptions/${pollID}`,
    success: (data) => {
      data.options.forEach((option) => {
        addOptionElement(option);
      });
      $('#user-answers').sortable();
      addTitleElement(data.title);
    }
  });


  $("#confirm-btn").on('click', () => {

    const answers = [];

    document.querySelectorAll('.option').forEach((el) => {
      const optionId = el.getAttribute('optionID');
      answers.push(optionId);
    });
    const currentURL = window.location.href;
    const pollID = currentURL.split('/')[currentURL.split('/').length - 1];

    // TODO: send array via ajax to POST answer
    $.ajax({
      method: 'POST',
      url: '/poll/answers',
      data: { pollID, answers },
      success: () => {
        window.location = `http://localhost:8080/submit/`;


      },
      error: (err) => {
        alert(err + 'error, please try again!');
      }
    });
    console.log(answers);
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

const addTitleElement = (title) => {
  const inputHTML = `
  <p>${title}</p>`;

  $('#poll-title').append(inputHTML);


};




