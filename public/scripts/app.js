/* eslint-disable no-undef */
// Client facing scripts here
$(document).ready(function() {

  $('form').on('click', 'button', function(event) {
    event.preventDefault();

    $('.alert-user').slideUp();
    if ($('#email-text').val().length <= 1) {
      $('.alert-user').slideDown(750).text('You need an email 🙄');
      return;
    }

    if ($('#title-text').val().length <= 1) {
      $('.alert-user').slideDown(750).text('You have not created a title, don\'t be shy!   😎');
      return;
    }

    if ($('#poll-question-1').val().length <= 1) {
      $('.alert-user').slideDown(750).text('Can\'t vote without options give atleast 2!');
      return;
    }

    if ($('#poll-question-2').val().length <= 1) {
      $('.alert-user').slideDown(750).text('Can\'t vote without options give atleast 2!');
      return;
    }

  });

});
