import $ from 'jquery';

$(document).ready(function() {
    // Show/hide mobile menu
    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        $('body').toggleClass('menu-open');
    });
    $(document).keyup(function(e) {
    if (e.keyCode === 27) {
            $('body').removeClass('menu-open');
    }
  });

  $('.search-toggle').click(e => {
    // e.preventDefault();
    // $('body').toggleClass('search-open');

    // $('.search-toggle').toggle(() => {
    //   $('.search-toggle').css({ marginRight: '20px' });
    // }, () => {
    //   $('.search-toggle').css({ marginRight: 0 });
    // });

    // $('body').toggleClass('menu-toggle');
    // $('.logo').toggleClass('logo-hidden');
  });

  $('.search-cancel').click(e => {
    e.preventDefault();
    $('body').removeClass('search-open');
  });

    // Brawl week switching
    $(document).on('click', '.week-control-last',function(e) {
        e.preventDefault();
        $('.brawl-feature').addClass('last-week-showing');
    });

    $(document).on('click', '.week-control-this',function(e) {
        e.preventDefault();
        $('.brawl-feature').removeClass('last-week-showing');
    });

    // Modal
    $('.modal-trigger').click(function(e) {
        e.preventDefault();
        $('body').addClass('modal-showing');
    });
    $(document).keyup(function(e) {
    if (e.keyCode === 27) {
            $('body').removeClass('modal-showing');
            $('.login-modal').css({visibility: 'hidden', opacity: 0});
    }
  });

    // Modal password
    $('.modal-trigger-create-brawl').click(function(e) {
        e.preventDefault();
        $('body').addClass('modal-showing');
        $('.overlay-create-brawl').removeClass('is-hidden').next('.overlay').addClass('is-hidden');
    });



    // Modal password
    $(document).on('click','.modal-trigger-report-issue',function(e) {
        e.preventDefault();
        $('#report').parent('.modal').css({visibility: "visible", opacity: 1})
        $('.overlay-create-brawl').addClass('is-hidden').next('.overlay').removeClass('is-hidden');
        $('.login-modal ').hide();
    });

    $('#bookSubmit').click(function(e){
        e.preventDefault();
        $('#coverSubmit').click();
    })

    //login modal
    $('#loginButton').click(function(e){
        $('.login-modal').css({visibility: 'visible', opacity: 1});
            e.preventDefault();
    })

    $('#deleteButton').click(function(e){
        $('.delete-modal').css({visibility: 'visible', opacity: 1});
        e.preventDefault();
    });

    $('.overlay').on('click',function(e){
        if(e.target.classList.contains('overlay') || e.target.classList.contains('close')){
            $('body').removeClass('modal-showing');
            $('.overlay').removeClass('is-hidden');
            $('.login-modal').removeAttr('style');
            $('#report').parent('.modal').removeAttr('style');
        }
    })


});
