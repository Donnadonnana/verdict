/* eslint-disable no-undef */
// $(document).ready(function() {
//   const currentURL = window.location.href;
//   const pollID = currentURL.split('/')[currentURL.split('/').length - 1];

//   $.ajax({
//     method: "GET",
//     url: `/poll/results/${pollID}`,
//     success: (res) => {
//       alert(res);
//       // console.log(data);
//       // data.forEach((data) => {
//       //   const rank = data.rank;
//       //   const pollID = data.pollID;
//       //   alert(rank);
//       //   alert(pollID);
//       //   addResultsElement(data);
//       // });
//     }
//   });

// });
const addResultsElement = (option) => {
  const inputHTML = `
  <li class="option" optionID="${option.id}">
  <div class="option-title">
    ${option.title}
  </div>
    <div class="option-description"> ${option.description}</div>
  </li>`;

  $('#results').append(inputHTML);
};


